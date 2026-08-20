// =========== Loading Spinner Design ============
/*
<div class="flex items-center justify-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
</div>
*/

// =========== Empty State Design ============


export class Meal {
  constructor(raw = {}) {
    this.id = raw.id ?? raw.idMeal ?? null;
    this.name = raw.name ?? raw.strMeal ?? "Untitled meal";
    this.category = raw.category ?? raw.strCategory ?? "Uncategorized";
    this.area = raw.area ?? raw.strArea ?? "Unknown";
    this.thumbnail = raw.thumbnail ?? raw.strMealThumb ?? "";
    this.instructions = raw.instructions ?? raw.strInstructions ?? "";
    this.video = raw.video ?? raw.strYoutube ?? "";
    this.ingredients = this.#extractIngredients(raw);
    this.nutrition = raw.nutrition ?? null;
  }

  #extractIngredients(raw) {
    if (Array.isArray(raw.ingredients)) {
      return raw.ingredients
        .map((i) => ({
          name: (i.name ?? i.ingredient ?? "").toString().trim(),
          measure: (i.measure ?? i.quantity ?? "").toString().trim(),
        }))
        .filter((i) => i.name);
    }

    const list = [];
    for (let i = 1; i <= 20; i++) {
      const name = raw[`strIngredient${i}`];
      const measure = raw[`strMeasure${i}`];
      if (name && name.trim()) list.push({ name: name.trim(), measure: (measure || "").trim() });
    }
    return list;
  }

  get ingredientsAsStrings() {
    return this.ingredients.map((i) => (i.measure ? `${i.measure} ${i.name}` : i.name));
  }

  get instructionSteps() {
    if (Array.isArray(this.instructions)) {
      return this.instructions.map((s) => String(s).trim()).filter(Boolean);
    }

    return String(this.instructions || "")
      .split(/\r?\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  get youtubeEmbedUrl() {
    if (!this.video) return "";
    const id = this.video.split("v=")[1] || this.video.split("/").pop();
    return id ? `https://www.youtube.com/embed/${id}` : "";
  }
}

export class Product {
  constructor(raw = {}) {
    this.barcode = raw.barcode ?? raw.code ?? "";
    this.name = raw.name ?? raw.product_name ?? "Unknown product";
    this.brand = raw.brand ?? raw.brands ?? "";
    this.image = raw.image ?? raw.image_url ?? "";
    this.category = raw.category ?? raw.categories ?? "";
    this.grade = (raw.grade ?? raw.nutriscore_grade ?? "").toLowerCase() || null;
    this.nova = raw.nova_group ?? raw.nova ?? null;
    this.weight = raw.quantity ?? raw.weight ?? "";

    const n = raw.nutriments ?? raw.nutrition ?? {};
    this.calories = Number(n.calories ?? n["energy-kcal_100g"] ?? 0);
    this.protein = Number(n.protein ?? n.proteins_100g ?? 0);
    this.carbs = Number(n.carbs ?? n.carbohydrates_100g ?? 0);
    this.fat = Number(n.fat ?? n.fat_100g ?? 0);
    this.sugar = Number(n.sugars_100g ?? n.sugar ?? 0);
  }
}


export class FoodEntry {
  constructor({ id, sourceType, name, image, calories, protein, carbs, fat, loggedAt }) {
    this.id = id ?? crypto.randomUUID();
    this.sourceType = sourceType; // "meal" | "product" | "custom"
    this.name = name;
    this.image = image;
    this.calories = Number(calories) || 0;
    this.protein = Number(protein) || 0;
    this.carbs = Number(carbs) || 0;
    this.fat = Number(fat) || 0;
    this.loggedAt = loggedAt ?? new Date().toISOString();
  }

  static fromMeal(meal) {
    const n = meal.nutrition || {};
    return new FoodEntry({
      sourceType: "meal", name: meal.name, image: meal.thumbnail,
      calories: n.calories, protein: n.protein, carbs: n.carbs, fat: n.fat,
    });
  }

  static fromProduct(product) {
    return new FoodEntry({
      sourceType: "product", name: product.name, image: product.image,
      calories: product.calories, protein: product.protein, carbs: product.carbs, fat: product.fat,
    });
  }

  static fromJSON(obj) { return new FoodEntry(obj); }
}
const CATEGORY_STYLE = {
  Beef: {
    icon: "fa-drumstick-bite",
    from: "from-emerald-400",
    to: "to-green-500",
  },

  Pork: {
    icon: "fa-bacon",
    from: "from-rose-400",
    to: "to-pink-500",
  },

  Chicken: {
    icon: "fa-drumstick-bite",
    from: "from-amber-400",
    to: "to-orange-500",
  },

  Seafood: {
    icon: "fa-fish",
    from: "from-sky-400",
    to: "to-blue-500",
  },

  Dessert: {
    icon: "fa-ice-cream",
    from: "from-pink-400",
    to: "to-rose-500",
  },

  Side: {
    icon: "fa-bowl-rice",
    from: "from-teal-400",
    to: "to-emerald-500",
  },

  Lamb: {
    icon: "fa-bone",
    from: "from-red-400",
    to: "to-rose-600",
  },

  Starter: {
    icon: "fa-leaf",
    from: "from-green-400",
    to: "to-emerald-500",
  },

  Vegan: {
    icon: "fa-seedling",
    from: "from-lime-400",
    to: "to-green-600",
  },

  Miscellaneous: {
    icon: "fa-utensils",
    from: "from-slate-400",
    to: "to-gray-500",
  },

  Pasta: {
    icon: "fa-bowl-food",
    from: "from-yellow-400",
    to: "to-amber-500",
  },

  Vegetarian: {
    icon: "fa-carrot",
    from: "from-orange-400",
    to: "to-amber-500",
  },
};
const DEFAULT_CATEGORY_STYLE = {
  icon: "fa-bowl-food",
  from: "from-teal-400",
  to: "to-emerald-500",
};
const MEAL_AREAS = [
  "Egyptian",
  "Afghan",
  "American",
  "British",
  "Canadian",
  "Chinese",
  "Croatian",
  "Dutch",
  "Filipino",
  "French",
  "Greek",
  "Indian",
  "Irish",
  "Italian",
  "Jamaican",
  "Japanese",
  "Kenyan",
  "Malaysian",
  "Mexican",
  "Moroccan",
  "Polish",
  "Portuguese",
  "Russian",
  "Spanish",
  "Thai",
  "Tunisian",
  "Turkish",
  "Ukrainian",
  "Vietnamese",
];

const MY_MEAL_CATEGORIES = [
  "Beef",
  "Chicken",
  "Dessert",
  "Lamb",
  "Miscellaneous",
  "Pork",
  "Seafood",
  "Side",
  "Starter",
  "Vegan",
  "Pasta",
  "Vegetarian",
];
export class MealsView {
  constructor({ api, onSelectMeal }) {
    this.api = api;
    this.onSelectMeal = onSelectMeal;

    this.categoriesGrid =
      document.getElementById("categories-grid");

    this.areaFilterContainer = document.querySelector(
      "#search-filters-section .overflow-x-auto"
    );

    this.recipesGrid =
      document.getElementById("recipes-grid");

    this.recipesCount =
      document.getElementById("recipes-count");

    this.searchInput =
      document.getElementById("search-input");

    this.gridViewBtn =
      document.getElementById("grid-view-btn");

    this.listViewBtn =
      document.getElementById("list-view-btn");

    this.activeCategory = "";
    this.activeArea = "";
    let searchTimer;

    this.searchInput?.addEventListener("input", () => {
      clearTimeout(searchTimer);

      searchTimer = setTimeout(() => {
        this.#search(
          this.searchInput.value.trim()
        );
      }, 400);
    });
    this.gridViewBtn?.addEventListener(
      "click",
      () => this.#setLayout("grid")
    );

    this.listViewBtn?.addEventListener(
      "click",
      () => this.#setLayout("list")
    );
  }
  async init() {
    this.#renderBrowseSections();

    this.#setLayout("grid");

    await this.#loadRecipes();
  }
  #renderBrowseSections() {
    if (this.areaFilterContainer) {
      this.areaFilterContainer.innerHTML = `
        <button
          type="button"
          class="meal-area-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all"
          data-area=""
        >
          All Recipes
        </button>
        ${MEAL_AREAS.map(
          (area) => `
            <button
              type="button"
              class="meal-area-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
              data-area="${area}"
            >
              ${area}
            </button>
          `
        ).join("")}
      `;
    }

    if (this.categoriesGrid) {
      this.categoriesGrid.innerHTML = MY_MEAL_CATEGORIES.map((category) => {
        const style = CATEGORY_STYLE[category] || DEFAULT_CATEGORY_STYLE;

        return `
          <div
            class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
            data-category="${category}"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="text-white w-9 h-9 bg-gradient-to-br ${style.from} ${style.to} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
              >
                <i class="fa-solid ${style.icon}"></i>
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-900">${category}</h3>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

    document
      .querySelectorAll(".meal-area-btn")
      .forEach((button) => {
        button.addEventListener("click", () => {
          this.activeArea = button.dataset.area;
          this.activeCategory = "";

          if (this.searchInput) {
            this.searchInput.value = "";
          }

          document
            .querySelectorAll(".meal-area-btn")
            .forEach((btn) => {
              btn.classList.remove("bg-emerald-600", "text-white");
              btn.classList.add("bg-gray-100", "text-gray-700");
            });

          button.classList.remove("bg-gray-100", "text-gray-700");
          button.classList.add("bg-emerald-600", "text-white");

          document
            .querySelectorAll(".category-card")
            .forEach((card) => {
              card.classList.remove("border-emerald-500", "bg-emerald-50");
            });

          this.#loadRecipes();
        });
      });

    document
      .querySelectorAll(".category-card")
      .forEach((card) => {
        card.addEventListener("click", () => {
          this.activeCategory = card.dataset.category;
          this.activeArea = "";

          if (this.searchInput) {
            this.searchInput.value = "";
          }

          document
            .querySelectorAll(".meal-area-btn")
            .forEach((btn) => {
              btn.classList.remove("bg-emerald-600", "text-white");
              btn.classList.add("bg-gray-100", "text-gray-700");
            });

          document
            .querySelectorAll(".category-card")
            .forEach((c) => {
              c.classList.remove("border-emerald-500", "bg-emerald-50");
            });

          card.classList.add("border-emerald-500", "bg-emerald-50");

          this.#loadRecipes();
        });
      });
  }
 async #search(query) {

    if (!query) {
      await this.#loadRecipes();
      return;
    }

    this.recipesGrid.innerHTML = `
      <p class="text-sm text-gray-500">
        Searching...
      </p>
    `;
    try {
      let meals =
        await this.api.searchMeals(query);
      if (Array.isArray(meals)) {
        meals = meals.slice(0, 25);
      }
      this.#renderRecipes(meals);
    } catch (err) {
      console.error(err);
      this.recipesGrid.innerHTML = `
        <p class="text-sm text-red-500">
          Search failed.
        </p>
      `;
    }
}
  async #loadRecipes() {
    this.recipesGrid.innerHTML = `
      <p class="text-sm text-gray-500 col-span-full">
        Loading recipes...
      </p>
    `;
    try {
      let meals;
      if (this.activeCategory) {

        meals = await this.api.filterMeals({
          category: this.activeCategory,
          area: "",
        });

      }
      else if (this.activeArea) {

        meals = await this.api.filterMeals({
          category: "",
          area: this.activeArea,
        });

      }
      else {
        meals =
          await this.api.getRandomMeals(25);
      }
      if (!Array.isArray(meals)) {
        meals = [];
      }
      meals = meals.slice(0, 25);
      this.#renderRecipes(meals);

    } catch (err) {

      console.error(err);

      this.recipesGrid.innerHTML = `
        <div
          class="
            col-span-full
            text-center
            py-10
          "
        >
          <p class="text-red-500">
            Couldn't load recipes.
          </p>
        </div>
      `;
    }
  }
  #setLayout(mode) {

    if (!this.recipesGrid) return;


   if (mode === "grid") {

      this.recipesGrid.className = `
        grid
   grid-cols-4
   gap-5
      `;

      if (this.gridViewBtn) {
        this.gridViewBtn.className =
          "px-3 py-1.5 bg-white rounded-md shadow-sm";
      }


      if (this.listViewBtn) {
        this.listViewBtn.className =
          "px-3 py-1.5";
      }

    } else {

      this.recipesGrid.className = `
        grid
        grid-cols-2
        gap-4
      `;


      if (this.listViewBtn) {
        this.listViewBtn.className =
          "px-3 py-1.5 bg-white rounded-md shadow-sm";
      }


      if (this.gridViewBtn) {
        this.gridViewBtn.className =
          "px-3 py-1.5";
      }
    }
  }
 #renderRecipes(meals) {

  if (!Array.isArray(meals)) {
    meals = [];
  }
  if (this.recipesCount) {
    this.recipesCount.textContent =
      `Showing ${meals.length} recipes`;
  }
  if (!meals.length) {

    this.recipesGrid.innerHTML = `
      <div
        class="
          col-span-full
          text-center
          py-12
        "
      >

        <i
          class="
            fa-solid
            fa-utensils
            text-4xl
            text-gray-300
            mb-3
          "
        ></i>

        <p
          class="
            text-gray-500
            font-medium
          "
        >
          No recipes found.
        </p>

      </div>
    `;

    return;
  }

  this.recipesGrid.innerHTML = meals
    .map((meal) => {

      return `

        <div
          class="
            recipe-card
            bg-white
            rounded-xl
            overflow-hidden
            border
            border-gray-100
            shadow-sm
            hover:shadow-lg
            transition-all
            cursor-pointer
            group
          "
          data-meal-id="${meal.id}"
        >

         

          <div
            class="
              relative
              h-48
              overflow-hidden
            "
          >

            <img
              src="${meal.thumbnail}"
              alt="${meal.name}"
              loading="lazy"
              class="
                w-full
                h-full
                object-cover
                group-hover:scale-105
                transition-transform
                duration-500
              "
            />



            <span
              class="
                absolute
                top-3
                left-3
                px-3
                py-1
                bg-emerald-500
                text-white
                text-xs
                font-semibold
                rounded-full
              "
            >
              ${meal.category || "Meal"}
            </span>


        

            <button
              type="button"
              class="
                absolute
                top-3
                right-3
                w-9
                h-9
                rounded-full
                bg-white/90
                flex
                items-center
                justify-center
                text-gray-600
                hover:text-red-500
                transition-colors
              "
              onclick="event.stopPropagation()"
            >

              <i class="fa-regular fa-heart"></i>

            </button>

          </div>



          <div class="p-4">

            <h3
              class="
                text-base
                font-bold
                text-gray-900
                mb-2
                group-hover:text-emerald-600
                transition-colors
                line-clamp-1
              "
            >
              ${meal.name}
            </h3>


            <p
              class="
                text-xs
                text-gray-500
                mb-3
                line-clamp-2
              "
            >
              Delicious ${meal.category || "meal"}
              recipe from ${meal.area || "around the world"}.
            </p>


            <div
              class="
                flex
                items-center
                justify-between
                text-xs
              "
            >

              <span
                class="
                  font-semibold
                  text-gray-800
                "
              >

                <i
                  class="
                    fa-solid
                    fa-utensils
                    text-emerald-600
                    mr-1
                  "
                ></i>

                ${meal.category || "Meal"}

              </span>


              <span
                class="
                  font-semibold
                  text-gray-500
                "
              >

                <i
                  class="
                    fa-solid
                    fa-globe
                    text-blue-500
                    mr-1
                  "
                ></i>

                ${meal.area || "Unknown"}

              </span>

            </div>

          </div>

        </div>

      `;
    })
    .join("")
  this.recipesGrid
  .querySelectorAll(".recipe-card")
  .forEach((card) => {
    card.addEventListener("click", () => {
      this.onSelectMeal(card.dataset.mealId);
    });
  });

}}


export class MealDetailsView {
  constructor({ api, foodLog, onBack, onLogged }) {
    this.api = api;
    this.foodLog = foodLog;
    this.onBack = onBack;
    this.onLogged = onLogged;
    this.container = document.getElementById("meal-details");
  }

  async show(id) {
    if (!this.container) return;
    this.#renderLoading();

    try {
      const meal = await this.api.getMealById(id);
      this.#render(meal);
    } catch (err) {
      console.error("Failed to load meal:", err);
      this.#renderError();
    }
  }

  #renderLoading() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto py-20 text-center text-gray-500">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        Loading recipe...
      </div>
    `;
  }

  #renderError() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto py-20 text-center">
        <p class="text-red-500 font-medium mb-4">Couldn't load this recipe.</p>
        <button id="back-to-meals-btn" class="text-emerald-600 font-semibold">
          <i class="fa-solid fa-arrow-left mr-2"></i>Back to Recipes
        </button>
      </div>
    `;
    document
      .getElementById("back-to-meals-btn")
      ?.addEventListener("click", () => this.onBack?.());
  }#getNutrition(meal) {
    if (meal.nutrition) return meal.nutrition;

    
    const count = meal.ingredients.length || 5;
    return {
      calories: count * 90,
      protein: count * 6,
      carbs: count * 10,
      fat: count * 4,
    };
  }

  #nutrientRow(label, value, unit, colorClass) {
    const percent = Math.min(100, Math.round((value / 60) * 100));
    return `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full ${colorClass}"></div>
          <span class="text-gray-700">${label}</span>
        </div>
        <span class="font-bold text-gray-900">${Math.round(value)}${unit}</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="${colorClass} h-2 rounded-full" style="width: ${percent}%"></div>
      </div>
    `;
  }

  #render(meal) {
    const nutrition = this.#getNutrition(meal);
    const servingsGuess = 4;
    const caloriesPerServing = Math.round(nutrition.calories);

    const ingredientsHtml = meal.ingredients.length
      ? meal.ingredients
          .map(
            (ing) => `
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
                <span class="text-gray-700">
                  ${ing.measure ? `<span class="font-medium text-gray-900">${ing.measure}</span>` : ""}
                  ${ing.name}
                </span>
              </div>
            `
          )
          .join("")
      : `<p class="text-sm text-gray-500">No ingredients listed.</p>`;

    const steps = meal.instructionSteps.length
      ? meal.instructionSteps
      : ["No instructions available."];

    const instructionsHtml = steps
      .map(
        (step, i) => `
          <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              ${i + 1}
            </div>
            <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
          </div>
        `
      )
      .join("");

    const videoHtml = meal.youtubeEmbedUrl
      ? `
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-video text-red-500"></i>
            Video Tutorial
          </h2>
          <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
            <iframe src="${meal.youtubeEmbedUrl}" class="absolute inset-0 w-full h-full" frameborder="0" allowfullscreen></iframe>
          </div>
        </div>
      `
      : "";

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Back to Recipes</span>
        </button>

        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div class="relative h-80 md:h-96">
            <img src="${meal.thumbnail}" alt="${meal.name}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <div class="flex items-center gap-3 mb-3">
                <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.category}</span>
                <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.area}</span>
              </div>
              <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${meal.name}</h1>
              <div class="flex items-center gap-6 text-white/90">
                <span class="flex items-center gap-2">
                  <i class="fa-solid fa-utensils"></i>
                  <span>${servingsGuess} servings</span>
                </span>
                <span class="flex items-center gap-2">
                  <i class="fa-solid fa-fire"></i>
                  <span>${caloriesPerServing} cal/serving</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mb-8">
          <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
            <i class="fa-solid fa-clipboard-list"></i>
            <span>Log This Meal</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-list-check text-emerald-600"></i>
                Ingredients
                <span class="text-sm font-normal text-gray-500 ml-auto">${meal.ingredients.length} items</span>
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${ingredientsHtml}
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
                Instructions
              </h2>
              <div class="space-y-4">
                ${instructionsHtml}
              </div>
            </div>

            ${videoHtml}
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                Nutrition Facts
              </h2>
              <p class="text-sm text-gray-500 mb-4">Per serving</p>
              <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
                <p class="text-sm text-gray-600">Calories per serving</p>
                <p class="text-4xl font-bold text-emerald-600">${caloriesPerServing}</p>
                <p class="text-xs text-gray-500 mt-1">Total: ${Math.round(nutrition.calories * servingsGuess)} cal</p>
              </div>

              <div class="space-y-4">
                ${this.#nutrientRow("Protein", nutrition.protein, "g", "bg-emerald-500")}
                ${this.#nutrientRow("Carbs", nutrition.carbs, "g", "bg-blue-500")}
                ${this.#nutrientRow("Fat", nutrition.fat, "g", "bg-purple-500")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document
      .getElementById("back-to-meals-btn")
      ?.addEventListener("click", () => this.onBack?.());

    document
      .getElementById("log-meal-btn")
      ?.addEventListener("click", () => this.#openLogModal(meal, nutrition));
  }

  async #openLogModal(meal, nutrition) {
    if (typeof Swal === "undefined") {
      this.foodLog.addEntry(
        new FoodEntry({
          sourceType: "meal",
          name: meal.name,
          image: meal.thumbnail,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
        })
      );
      this.onLogged?.();
      return;
    }

    let servings = 1;

    const html = `
      <div style="text-align:left">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <img src="${meal.thumbnail}" style="width:56px;height:56px;border-radius:12px;object-fit:cover;" />
          <div>
            <p style="font-weight:700;font-size:1.1rem;margin:0;">Log This Meal</p>
            <p style="color:#6b7280;margin:0;">${meal.name}</p>
          </div>
        </div>
        <p style="font-weight:600;margin-bottom:8px;">Number of Servings</p>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <button type="button" id="servings-minus" style="width:36px;height:36px;border-radius:8px;border:1px solid #e5e7eb;background:#f9fafb;font-size:1.2rem;cursor:pointer;">&minus;</button>
          <div id="servings-value" style="width:60px;text-align:center;font-weight:700;font-size:1.2rem;border:1px solid #e5e7eb;border-radius:10px;padding:8px;">1</div>
          <button type="button" id="servings-plus" style="width:36px;height:36px;border-radius:8px;border:1px solid #e5e7eb;background:#f9fafb;font-size:1.2rem;cursor:pointer;">+</button>
        </div>
        <div style="background:#ecfdf5;border-radius:12px;padding:16px;">
          <p style="color:#374151;margin-bottom:10px;">Estimated nutrition per serving:</p>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;">
            <div><p id="n-cal" style="color:#059669;font-weight:700;margin:0;">${Math.round(nutrition.calories)}</p><p style="font-size:.75rem;color:#6b7280;margin:0;">Calories</p></div>
            <div><p id="n-protein" style="color:#2563eb;font-weight:700;margin:0;">${Math.round(nutrition.protein)}g</p><p style="font-size:.75rem;color:#6b7280;margin:0;">Protein</p></div>
            <div><p id="n-carbs" style="color:#d97706;font-weight:700;margin:0;">${Math.round(nutrition.carbs)}g</p><p style="font-size:.75rem;color:#6b7280;margin:0;">Carbs</p></div>
            <div><p id="n-fat" style="color:#7c3aed;font-weight:700;margin:0;">${Math.round(nutrition.fat)}g</p><p style="font-size:.75rem;color:#6b7280;margin:0;">Fat</p></div>
          </div>
        </div>
      </div>
    `;

    const result = await Swal.fire({
      html,
      showCancelButton: true,
      confirmButtonText: "Log Meal",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      focusConfirm: false,
      didOpen: () => {
        const update = () => {
          document.getElementById("servings-value").textContent = servings;
          document.getElementById("n-cal").textContent = Math.round(nutrition.calories * servings);
          document.getElementById("n-protein").textContent = Math.round(nutrition.protein * servings) + "g";
          document.getElementById("n-carbs").textContent = Math.round(nutrition.carbs * servings) + "g";
          document.getElementById("n-fat").textContent = Math.round(nutrition.fat * servings) + "g";
        };
        document.getElementById("servings-minus")?.addEventListener("click", () => {
          servings = Math.max(1, servings - 1);
          update();
        });
        document.getElementById("servings-plus")?.addEventListener("click", () => {
          servings += 1;
          update();
        });
      },
    });

    if (result.isConfirmed) {
      const totalCalories = Math.round(nutrition.calories * servings);

      this.foodLog.addEntry(
        new FoodEntry({
          sourceType: "meal",
          name: meal.name,
          image: meal.thumbnail,
          calories: nutrition.calories * servings,
          protein: nutrition.protein * servings,
          carbs: nutrition.carbs * servings,
          fat: nutrition.fat * servings,
        })
      );

      await Swal.fire({
        icon: "success",
        title: "Meal Logged!",
        html: `${meal.name} (${servings} serving${servings > 1 ? "s" : ""}) has been added to your daily log.<br><span style="color:#059669;font-weight:700;font-size:1.1rem;">+${totalCalories} calories</span>`,
        confirmButtonColor: "#2563eb",
      });

      this.onLogged?.();
    }
  }
}


export class ProductsView {
  constructor({ api, foodLog, onLogged }) {
    this.api = api;
    this.foodLog = foodLog;
    this.onLogged = onLogged;

   this.grid = document.getElementById("products-grid");
    this.gridDefaultClass = this.grid ? this.grid.className : "";
    this.countEl = document.getElementById("products-count");
    this.searchInput = document.getElementById("product-search-input");
    this.searchBtn = document.getElementById("search-product-btn");
    this.barcodeInput = document.getElementById("barcode-input");
    this.lookupBtn = document.getElementById("lookup-barcode-btn");

    this.currentProducts = [];
    this.activeGrade = "";

    this.searchBtn?.addEventListener("click", () => this.#search());
    this.searchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.#search();
    });

    this.lookupBtn?.addEventListener("click", () => this.#lookupBarcode());
    this.barcodeInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.#lookupBarcode();
    });

    document.querySelectorAll(".product-category-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.textContent.trim();
        this.#loadCategory(category);
      });
    });

    document.querySelectorAll(".nutri-score-filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".nutri-score-filter").forEach((b) => {
          b.classList.remove("bg-emerald-600", "text-white");
        });
        btn.classList.add("bg-emerald-600", "text-white");
        this.activeGrade = btn.dataset.grade || "";
        this.#renderProducts(this.currentProducts);
      });
    });
  }

  #loading() {
    if (this.grid) {
      this.grid.innerHTML = `<p class="text-sm text-gray-500 col-span-full">Loading...</p>`;
    }
  }

  #error(msg) {
    if (this.grid) {
      this.grid.innerHTML = `<p class="text-sm text-red-500 col-span-full">${msg}</p>`;
    }
    if (this.countEl) this.countEl.textContent = msg;
  }

  async #search() {
    const query = this.searchInput?.value.trim();
    if (!query) return;
    this.#loading();
    try {
      this.currentProducts = await this.api.searchProducts(query);
      this.#renderProducts(this.currentProducts);
    } catch (err) {
      console.error(err);
      this.#error("Search failed.");
    }
  }

  async #lookupBarcode() {
    const code = this.barcodeInput?.value.trim();
    if (!code) return;
    this.#loading();
    try {
      const product = await this.api.getProductByBarcode(code);
      this.currentProducts = [product];
      this.#renderProducts(this.currentProducts);
    } catch (err) {
      console.error(err);
      this.#error("Product not found.");
    }
  }

  async #loadCategory(category) {
    this.#loading();
    try {
      this.currentProducts = await this.api.getProductsByCategory(category);
      this.#renderProducts(this.currentProducts);
    } catch (err) {
      console.error(err);
      this.#error(`No products found in ${category}.`);
    }
  }

  #renderProducts(products) {
    if (!Array.isArray(products)) products = [];

    const filtered = this.activeGrade
      ? products.filter((p) => p.grade === this.activeGrade)
      : products;

    if (this.countEl) {
      this.countEl.textContent = `Showing ${filtered.length} product${filtered.length === 1 ? "" : "s"}`;
    }

    if (!this.grid) return;

  if (!filtered.length) {
      this.grid.className = "w-full";
      this.grid.innerHTML = `
        <div class="text-center py-16">
          <div class="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-box-open text-3xl text-blue-300"></i>
          </div>
          <p class="text-lg font-semibold text-gray-900 mb-1">No products to display</p>
          <p class="text-gray-500">Search for a product or browse by category</p>
        </div>
      `;
      return;
    }

    this.grid.className = this.gridDefaultClass;

    const gradeColor = {
      a: "bg-green-500",
      b: "bg-lime-500",
      c: "bg-yellow-500",
      d: "bg-orange-500",
      e: "bg-red-500",
    };

    this.grid.innerHTML = filtered
      .map(
        (product, index) => `
          <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-index="${index}">
            <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${product.image || ""}" alt="${product.name}" loading="lazy" />
              ${
                product.grade
                  ? `<div class="absolute top-2 left-2 ${gradeColor[product.grade] || "bg-gray-400"} text-white text-xs font-bold px-2 py-1 rounded uppercase">Nutri-Score ${product.grade}</div>`
                  : ""
              }
              ${
                product.nova
                  ? `<div class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${product.nova}">${product.nova}</div>`
                  : ""
              }
            </div>
            <div class="p-4">
              <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${product.brand || "Unknown Brand"}</p>
              <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${product.name}</h3>
              <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span><i class="fa-solid fa-weight-scale mr-1"></i>${product.weight || "N/A"}</span>
                <span><i class="fa-solid fa-fire mr-1"></i>${Math.round(product.calories)} kcal/100g</span>
              </div>
              <div class="grid grid-cols-4 gap-1 text-center">
                <div class="bg-emerald-50 rounded p-1.5"><p class="text-xs font-bold text-emerald-700">${product.protein}g</p><p class="text-[10px] text-gray-500">Protein</p></div>
                <div class="bg-blue-50 rounded p-1.5"><p class="text-xs font-bold text-blue-700">${product.carbs}g</p><p class="text-[10px] text-gray-500">Carbs</p></div>
                <div class="bg-purple-50 rounded p-1.5"><p class="text-xs font-bold text-purple-700">${product.fat}g</p><p class="text-[10px] text-gray-500">Fat</p></div>
                <div class="bg-orange-50 rounded p-1.5"><p class="text-xs font-bold text-orange-700">${product.sugar}g</p><p class="text-[10px] text-gray-500">Sugar</p></div>
              </div>
            </div>
          </div>
        `
      )
      .join("");

    this.grid.querySelectorAll(".product-card").forEach((card) => {
      card.addEventListener("click", () => {
        const product = filtered[Number(card.dataset.index)];
        this.#openLogModal(product);
      });
    });
  }

  async #openLogModal(product) {
    if (typeof Swal === "undefined") {
      this.foodLog.addEntry(FoodEntry.fromProduct(product));
      this.onLogged?.();
      return;
    }

    let qty = 1;

    const html = `
      <div style="text-align:left">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <img src="${product.image || ""}" style="width:56px;height:56px;border-radius:12px;object-fit:cover;background:#f3f4f6;" />
          <div>
            <p style="font-weight:700;font-size:1.1rem;margin:0;">Log This Product</p>
            <p style="color:#6b7280;margin:0;">${product.name}</p>
          </div>
        </div>
        <p style="font-weight:600;margin-bottom:8px;">Servings (x100g)</p>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <button type="button" id="qty-minus" style="width:36px;height:36px;border-radius:8px;border:1px solid #e5e7eb;background:#f9fafb;font-size:1.2rem;cursor:pointer;">&minus;</button>
          <div id="qty-value" style="width:60px;text-align:center;font-weight:700;font-size:1.2rem;border:1px solid #e5e7eb;border-radius:10px;padding:8px;">1</div>
          <button type="button" id="qty-plus" style="width:36px;height:36px;border-radius:8px;border:1px solid #e5e7eb;background:#f9fafb;font-size:1.2rem;cursor:pointer;">+</button>
        </div>
        <div style="background:#eff6ff;border-radius:12px;padding:16px;">
          <p style="color:#374151;margin-bottom:10px;">Estimated nutrition:</p>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;">
            <div><p id="p-cal" style="color:#059669;font-weight:700;margin:0;">${Math.round(product.calories)}</p><p style="font-size:.75rem;color:#6b7280;margin:0;">Calories</p></div>
            <div><p id="p-protein" style="color:#2563eb;font-weight:700;margin:0;">${product.protein}g</p><p style="font-size:.75rem;color:#6b7280;margin:0;">Protein</p></div>
            <div><p id="p-carbs" style="color:#d97706;font-weight:700;margin:0;">${product.carbs}g</p><p style="font-size:.75rem;color:#6b7280;margin:0;">Carbs</p></div>
            <div><p id="p-fat" style="color:#7c3aed;font-weight:700;margin:0;">${product.fat}g</p><p style="font-size:.75rem;color:#6b7280;margin:0;">Fat</p></div>
          </div>
        </div>
      </div>
    `;

    const result = await Swal.fire({
      html,
      showCancelButton: true,
      confirmButtonText: "Log Product",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      focusConfirm: false,
      didOpen: () => {
        const update = () => {
          document.getElementById("qty-value").textContent = qty;
          document.getElementById("p-cal").textContent = Math.round(product.calories * qty);
          document.getElementById("p-protein").textContent = (product.protein * qty).toFixed(1) + "g";
          document.getElementById("p-carbs").textContent = (product.carbs * qty).toFixed(1) + "g";
          document.getElementById("p-fat").textContent = (product.fat * qty).toFixed(1) + "g";
        };
        document.getElementById("qty-minus")?.addEventListener("click", () => {
          qty = Math.max(1, qty - 1);
          update();
        });
        document.getElementById("qty-plus")?.addEventListener("click", () => {
          qty += 1;
          update();
        });
      },
    });
    if (result.isConfirmed) {
      this.foodLog.addEntry(
        new FoodEntry({
          sourceType: "product",
          name: product.name,
          image: product.image,
          calories: product.calories * qty,
          protein: product.protein * qty,
          carbs: product.carbs * qty,
          fat: product.fat * qty,
        })
      );
      this.onLogged?.();
    }
  }
}


export class FoodLogView {
  constructor({ foodLog }) {
    this.foodLog = foodLog;
    this.container = document.getElementById("foodlog-section");
    this.dateEl = document.getElementById("foodlog-date");
    this.listEl = document.getElementById("logged-items-list");
    this.clearBtn = document.getElementById("clear-foodlog");
    this.chartEl = document.getElementById("weekly-chart");

    const todaySection = document.getElementById("foodlog-today-section");
    this.progressGrid = todaySection?.querySelector(".grid") ?? null;
    this.itemsCountLabel = todaySection?.querySelector("h4") ?? null;

    this.clearBtn?.addEventListener("click", () => {
      if (confirm("Clear all logged meals for today?")) {
        this.foodLog.todayEntries.forEach((entry) =>
          this.foodLog.removeEntry(entry.id)
        );
        this.render();
      }
    });

    document.querySelectorAll(".quick-log-btn").forEach((btn, index) => {
      btn.addEventListener("click", () => {
        if (index === 0) window.location.hash = "#home";
        if (index === 1) this.#openCustomEntry();
      });
    });
  }

  render() {
    if (this.dateEl) {
      this.dateEl.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }

    this.#renderProgress();
    this.#renderList();
    this.#renderChart();
  }

  #renderProgress() {
    if (!this.progressGrid) return;

    const totals = this.foodLog.todayTotals;
    const targets = this.foodLog.targets;
    const keys = ["calories", "protein", "carbs", "fat"];
    const units = ["kcal", "g", "g", "g"];
    const cards = this.progressGrid.children;

    keys.forEach((key, i) => {
      const card = cards[i];
      if (!card) return;

      const labelRow = card.children[0];
      const valueSpan = labelRow?.children[1];
      const barOuter = card.children[1];
      const barInner = barOuter?.children[0];

      const percent = Math.min(
        100,
        Math.round((totals[key] / (targets[key] || 1)) * 100)
      );

      if (valueSpan) {
        valueSpan.textContent = `${Math.round(totals[key])} / ${targets[key]} ${units[i]}`;
      }
      if (barInner) {
        barInner.style.width = `${percent}%`;
      }
    });
  }

  #renderList() {
    const entries = this.foodLog.todayEntries;

    if (this.itemsCountLabel) {
      this.itemsCountLabel.textContent = `Logged Items (${entries.length})`;
    }
    if (this.clearBtn) {
      this.clearBtn.style.display = entries.length ? "" : "none";
    }
    if (!this.listEl) return;

  if (!entries.length) {
      this.listEl.innerHTML = `
        <div class="text-center py-12">
          <div class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-utensils text-3xl text-blue-300"></i>
          </div>
          <p class="text-lg font-semibold text-gray-900 mb-2">No food logged today</p>
          <p class="text-gray-500 mb-6">Start tracking your nutrition by logging meals</p>
          <button id="empty-browse-recipes-btn" class="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">
            <i class="fa-solid fa-plus mr-2"></i>Browse Recipes
          </button>
        </div>
      `;

      document.getElementById("empty-browse-recipes-btn")?.addEventListener("click", () => {
        window.location.hash = "#home";
      });

      return;
    }

    this.listEl.innerHTML = entries
      .map(
        (entry) => `
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl" data-id="${entry.id}">
            <img src="${entry.image || ""}" class="w-12 h-12 rounded-lg object-cover bg-gray-200" alt="${entry.name}" />
            <div class="flex-1">
              <p class="font-semibold text-gray-900 text-sm">${entry.name}</p>
              <p class="text-xs text-gray-500">${Math.round(entry.calories)} kcal &middot; ${Math.round(entry.protein)}g protein</p>
            </div>
            <button class="remove-entry-btn text-gray-400 hover:text-red-500 px-2" data-id="${entry.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `
      )
      .join("");

   this.listEl.querySelectorAll(".remove-entry-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.foodLog.removeEntry(btn.dataset.id);
        this.render();

        if (typeof Swal !== "undefined") {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Item deleted",
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true,
          });
        }
      });
    });
  }

 #renderChart() {
    if (!this.chartEl) return;

    const targetCalories = this.foodLog.targets.calories || 2000;
    const todayStr = new Date().toDateString();

    const days = [];
    let weekTotal = 0;
    let weekItems = 0;
    let daysOnGoal = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();

      const dayEntries = this.foodLog.entries.filter(
        (e) => new Date(e.loggedAt).toDateString() === dateStr
      );
      const dayCalories = Math.round(
        dayEntries.reduce((sum, e) => sum + e.calories, 0)
      );

      weekTotal += dayCalories;
      weekItems += dayEntries.length;

      if (dayCalories > 0 && dayCalories <= targetCalories * 1.1) {
        daysOnGoal += 1;
      }

      days.push({
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        num: date.getDate(),
        calories: dayCalories,
        items: dayEntries.length,
        isToday: dateStr === todayStr,
      });
    }

    const weeklyAverage = Math.round(weekTotal / 7);

    const daysHtml = days
      .map(
        (d) => `
          <div class="rounded-xl p-3 text-center ${
            d.isToday
              ? "bg-gray-50 border-2 border-gray-400"
              : "bg-gray-50 border-2 border-transparent"
          }">
            <p class="text-xs text-gray-500 mb-1">${d.label}</p>
            <p class="text-sm font-semibold text-gray-700 mb-2">${d.num}</p>
            <p class="text-xl font-bold ${d.isToday ? "text-indigo-600" : "text-gray-400"}">${d.calories}</p>
            <p class="text-xs text-gray-400 mb-1">kcal</p>
            <p class="text-xs text-gray-500">${d.items} item${d.items === 1 ? "" : "s"}</p>
          </div>
        `
      )
      .join("");

    this.chartEl.className = "";
    this.chartEl.innerHTML = `
      <div class="grid grid-cols-7 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-6">
        ${daysHtml}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="border-2 border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <i class="fa-solid fa-chart-line text-emerald-600"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">Weekly Average</p>
            <p class="text-lg font-bold text-gray-900">${weeklyAverage} kcal</p>
          </div>
        </div>
        <div class="border-2 border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
            <i class="fa-solid fa-utensils text-teal-600"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Items This Week</p>
            <p class="text-lg font-bold text-gray-900">${weekItems} items</p>
          </div>
        </div>
        <div class="border-2 border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <i class="fa-solid fa-bullseye text-purple-600"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">Days On Goal</p>
            <p class="text-lg font-bold text-gray-900">${daysOnGoal} / 7</p>
          </div>
        </div>
      </div>
    `;
  }

  async #openCustomEntry() {
    if (typeof Swal === "undefined") return;

    const { value } = await Swal.fire({
      title: "Custom Food Entry",
      html: `
        <input id="ce-name" class="swal2-input" placeholder="Food name">
        <input id="ce-cal" class="swal2-input" placeholder="Calories" type="number">
        <input id="ce-protein" class="swal2-input" placeholder="Protein (g)" type="number">
        <input id="ce-carbs" class="swal2-input" placeholder="Carbs (g)" type="number">
        <input id="ce-fat" class="swal2-input" placeholder="Fat (g)" type="number">
      `,
      confirmButtonText: "Add Entry",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      preConfirm: () => {
        const name = document.getElementById("ce-name").value.trim();
        if (!name) {
          Swal.showValidationMessage("Please enter a food name");
          return false;
        }
        return {
          name,
          calories: Number(document.getElementById("ce-cal").value) || 0,
          protein: Number(document.getElementById("ce-protein").value) || 0,
          carbs: Number(document.getElementById("ce-carbs").value) || 0,
          fat: Number(document.getElementById("ce-fat").value) || 0,
        };
      },
    });

    if (value) {
      this.foodLog.addEntry(new FoodEntry({ sourceType: "custom", ...value }));
      this.render();
    }
  }
}