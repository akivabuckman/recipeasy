import json
import re
from typing import Optional
from dataclasses import dataclass, asdict

import anthropic
import requests
from bs4 import BeautifulSoup


# ── Types ──────────────────────────────────────────────────────────────────────

@dataclass
class IngredientDetail:
    unit: Optional[str]   # str or None — never ""
    count: Optional[float]  # number or None — never a string


@dataclass
class RecipeOutput:
    ingredients: dict[str, IngredientDetail]
    instructions: list[str]


class InsufficientContentError(Exception):
    pass


# ── Constants ──────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a recipe extraction engine. You will be given raw text scraped from a webpage.
Your job is to extract the recipe ingredients and instructions and return them as strict JSON.

Return ONLY a valid JSON object — no markdown, no backticks, no explanation.

The JSON must match this exact shape:
{
  "ingredients": {
    "<ingredient name, lowercase, singular>": {
      "unit": "<unit string, e.g. 'cup', 'tbsp', 'g', 'oz', 'clove', 'pinch', 'whole'> OR null if no unit",
      "count": <number (integer or decimal) OR null if no count>
    }
  },
  "instructions": [
    "<step 1 as a clear, complete sentence>",
    "<step 2>",
    ...
  ]
}

Rules:
- ingredient keys must be lowercase, singular, trimmed strings (e.g. "garlic clove", "olive oil", "egg")
- unit must be a lowercase string or null — NEVER an empty string
- count must be a number or null — NEVER a string
- instructions must be an array of non-empty strings, one per step
- If a quantity is a fraction like "1/2", convert it to 0.5
- If the page contains no recipe, return: { "ingredients": {}, "instructions": [] }
- Do not include any text outside the JSON object"""

RECIPE_SELECTORS = [
    "[class*='recipe']",
    "[id*='recipe']",
    "[class*='ingredient']",
    "[class*='instruction']",
    "[class*='directions']",
    "[class*='wprm']",
    "[class*='tasty']",
    "[class*='mv-create']",
    "article",
    "main",
]

client = anthropic.Anthropic()


# ── Scraper ────────────────────────────────────────────────────────────────────

def scrape_url(url: str) -> str:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()

    print(f"[DEBUG] HTTP {response.status_code}, content length: {len(response.text)}")

    soup = BeautifulSoup(response.text, "html.parser")

    # Try to extract JSON-LD recipe schema first (most reliable)
    ld_scripts = soup.find_all("script", type="application/ld+json")
    print(f"[DEBUG] Found {len(ld_scripts)} JSON-LD scripts")
    for i, script in enumerate(ld_scripts):
        try:
            data = json.loads(script.string or "")

            # Unwrap @graph if present
            if isinstance(data, dict) and "@graph" in data:
                data = data["@graph"]

            # Normalize to list
            if not isinstance(data, list):
                data = [data]

            print(f"[DEBUG] JSON-LD script {i} types: {[item.get('@type') for item in data if isinstance(item, dict)]}")

            # Find Recipe node
            recipe_data = None
            for item in data:
                if isinstance(item, dict):
                    item_type = item.get("@type", "")
                    if item_type == "Recipe" or (isinstance(item_type, list) and "Recipe" in item_type):
                        recipe_data = item
                        break

            if recipe_data:
                print(f"[DEBUG] Found Recipe in JSON-LD script {i}, keys: {list(recipe_data.keys())}")
                parts = []
                if "name" in recipe_data:
                    parts.append(f"Recipe: {recipe_data['name']}")
                if "recipeIngredient" in recipe_data:
                    parts.append("Ingredients:\n" + "\n".join(recipe_data["recipeIngredient"]))
                if "recipeInstructions" in recipe_data:
                    steps = []
                    for step in recipe_data["recipeInstructions"]:
                        if isinstance(step, str):
                            steps.append(step)
                        elif isinstance(step, dict):
                            # Handle HowToSection with itemListElement
                            if "itemListElement" in step:
                                for sub in step["itemListElement"]:
                                    if isinstance(sub, dict):
                                        steps.append(sub.get("text", ""))
                            else:
                                steps.append(step.get("text", ""))
                    parts.append("Instructions:\n" + "\n".join(s for s in steps if s))
                if len(parts) >= 2:  # at least name + one section
                    result = "\n\n".join(parts)[:12000]
                    print(f"[DEBUG] JSON-LD extraction successful, length: {len(result)}")
                    print(f"[DEBUG] Extracted text sample:\n{result[:500]}")
                    return result
                else:
                    print(f"[DEBUG] Recipe found but missing sections, parts: {[p[:50] for p in parts]}")
        except (json.JSONDecodeError, AttributeError) as e:
            print(f"[DEBUG] JSON-LD script {i} parse error: {e}")
            continue

    # Remove noise
    for tag in soup(["script", "style", "nav", "footer", "header", "iframe", "noscript"]):
        tag.decompose()
    for tag in soup.find_all(class_=re.compile(r"ads?|advertisement|sidebar|comment|popup|newsletter")):
        tag.decompose()

    # Prefer semantic recipe containers
    content = ""
    for selector in RECIPE_SELECTORS:
        el = soup.select_one(selector)
        if el:
            text = el.get_text(separator=" ", strip=True)
            if len(text) > 100:
                content = text
                break

    # Fall back to full body
    if not content:
        content = soup.get_text(separator=" ", strip=True)

    # Collapse whitespace and cap length
    content = re.sub(r"\s+", " ", content).strip()
    print(f"[DEBUG] Fallback text content length: {len(content)}")
    print(f"[DEBUG] Fallback text sample:\n{content[:500]}")

    if len(content) < 200:
        raise InsufficientContentError("Page content too short")

    return content[:12000]


# ── Validation ─────────────────────────────────────────────────────────────────

def parse_count(value) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value) if value == value else None  # guard NaN
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return None
    return None


def parse_unit(value) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped.lower() if stripped else None
    return None


def validate_and_normalize(raw: dict) -> RecipeOutput:
    if not isinstance(raw, dict):
        raise ValueError("Response is not a JSON object")

    raw_ingredients = raw.get("ingredients", {})
    if not isinstance(raw_ingredients, dict):
        raise ValueError("'ingredients' must be an object")

    ingredients: dict[str, IngredientDetail] = {}
    for key, value in raw_ingredients.items():
        if not isinstance(key, str) or not key.strip():
            raise ValueError(f"Invalid ingredient key: {key!r}")
        if not isinstance(value, dict):
            raise ValueError(f"Ingredient '{key}' value must be an object")

        ingredients[key.strip().lower()] = IngredientDetail(
            unit=parse_unit(value.get("unit")),
            count=parse_count(value.get("count")),
        )

    raw_instructions = raw.get("instructions", [])
    if not isinstance(raw_instructions, list):
        raise ValueError("'instructions' must be an array")

    instructions: list[str] = [
        step.strip()
        for step in raw_instructions
        if isinstance(step, str) and step.strip()
    ]

    return RecipeOutput(ingredients=ingredients, instructions=instructions)


# ── Claude extraction ──────────────────────────────────────────────────────────

def extract_recipe(page_text: str) -> RecipeOutput:
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Extract the recipe from this page content:\n\n{page_text}",
            }
        ],
    )

    text_block = next(
        (block for block in message.content if block.type == "text"), None
    )
    if not text_block:
        raise ValueError("No text response from Claude")

    # Strip accidental markdown fences
    cleaned = re.sub(r"```json|```", "", text_block.text).strip()
    print(f"[DEBUG] Claude response:\n{cleaned[:500]}")

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        # Claude returned an explanation instead of JSON — content was insufficient
        raise InsufficientContentError("Claude could not extract recipe from page content")

    return validate_and_normalize(parsed)


# ── Serializer ─────────────────────────────────────────────────────────────────

def serialize_recipe(recipe: RecipeOutput) -> dict:
    return {
        "ingredients": {
            name: {"unit": detail.unit, "count": detail.count}
            for name, detail in recipe.ingredients.items()
        },
        "instructions": recipe.instructions,
    }


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
}


def make_response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }




def lambda_handler(event: dict, context) -> dict:
    # Handle preflight OPTIONS request
    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return make_response(200, {})

    # API Gateway passes body as a JSON string under "body" key
    if "body" in event:
        try:
            event = json.loads(event["body"])
        except (json.JSONDecodeError, TypeError):
            return make_response(400, {"error": "Invalid JSON body"})

    mode = event.get("mode")
    if mode not in ("scrape", "convert"):
        return make_response(400, {"error": "Missing or invalid 'mode' field — must be 'scrape' or 'convert'"})

    url = event.get("url")
    recipe_text = event.get("recipe")

    has_url = bool(url and isinstance(url, str))
    has_recipe = bool(recipe_text and isinstance(recipe_text, str))

    if mode == "scrape":
        if has_recipe:
            return make_response(400, {"error": "'recipe' must not be provided in scrape mode — use 'url' instead"})
        if not has_url:
            return make_response(400, {"error": "Missing 'url' field in scrape mode"})
        if not re.match(r"^https?://", url):
            return make_response(400, {"error": "URL must start with http:// or https://"})
    else:  # convert
        if has_url:
            return make_response(400, {"error": "'url' must not be provided in convert mode — use 'recipe' instead"})
        if not has_recipe:
            return make_response(400, {"error": "Missing 'recipe' field in convert mode"})

    try:
        if mode == "scrape":
            page_text = scrape_url(url)
        else:
            page_text = recipe_text

        recipe = extract_recipe(page_text)
        return make_response(200, serialize_recipe(recipe))
    except requests.HTTPError as e:
        status_code = e.response.status_code if e.response is not None else 502
        messages = {
            400: "The target site rejected the request as invalid.",
            401: "The target site requires authentication.",
            403: "The target site is blocking automated access.",
            404: "Recipe page not found — check the URL.",
            429: "The target site is rate limiting requests. Try again later.",
            500: "The target site is experiencing server errors.",
            503: "The target site is unavailable. Try again later.",
        }
        message = messages.get(status_code, f"The target site returned an error: {status_code}")
        return make_response(status_code, {"error": message})
    except InsufficientContentError:
        return make_response(422, {"error": "This website does not support scraping. It may require JavaScript to render or blocks automated access. Try a different recipe URL."})
    except Exception as e:
        print(f"Lambda error: {e}")
        return make_response(500, {"error": str(e)})