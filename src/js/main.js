/**
 * NutriPlan - Main Entry Point
 * 
 * This is the main entry point for the application.
 * Import your modules and initialize the app here.
/* ============================================================
   main.js
   Contains the "logic" classes (ApiService, FoodLogManager, Router,
   App) and boots the application. Imports the data/view classes
   from component.js.
   ============================================================ */
import {
  Meal,
  Product,
  FoodEntry,
  MealsView,
  MealDetailsView,
  ProductsView,
  FoodLogView,
} from "./ui/components.js";


class ApiService {
  static BASE_URL = "https://nutriplan-api.vercel.app/api";

  constructor(usdaApiKey = "") {
    this.usdaApiKey = usdaApiKey;
  }

  setUsdaApiKey(key) {
    this.usdaApiKey = key;
    localStorage.setItem("nutriplan_usda_key", key);
  }

  async #get(path) {
    const res = await fetch(`${ApiService.BASE_URL}${path}`);

    if (!res.ok) {
      throw new Error(`Request failed: ${path} (${res.status})`);
    }

    return res.json();
  }



  async searchMeals(name) {
    const data = await this.#get(
      `/meals/search?q=${encodeURIComponent(name)}`
    );

    return this.#toMealArray(data);
  }

  async filterMeals({ category, area } = {}) {
    const params = new URLSearchParams();

    if (category) params.set("category", category);
    if (area) params.set("area", area);

    const query = params.toString();

    const data = await this.#get(
      `/meals/filter${query ? `?${query}` : ""}`
    );

    return this.#toMealArray(data);
  }

 async getMealById(id) {
    const data = await this.#get(`/meals/${id}`);

    const raw =
      data?.result ??
      (Array.isArray(data) ? data[0] : data?.meals ? data.meals[0] : data);

    return new Meal(raw);
}

  async getRandomMeals(count = 25) {
    const data = await this.#get(`/meals/random?count=${count}`);

    return this.#toMealArray(data);
  }

  async getCategories() {
    const data = await this.#get(`/meals/categories`);

    return data.categories ?? data;
  }

  async getAreas() {
    const data = await this.#get(`/meals/areas`);

    return data.areas ?? data;
  }

  #toMealArray(data) {
    const list =
      data.meals ??
      data.results ??
      (Array.isArray(data.result) ? data.result : null) ??
      (Array.isArray(data) ? data : []);
    return list.map((meal) => new Meal(meal));
  }



  async analyzeNutrition(ingredientStrings) {
    if (!this.usdaApiKey) {
      throw new Error("Missing USDA API key");
    }

    const res = await fetch(
      `${ApiService.BASE_URL}/nutrition/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.usdaApiKey,
        },
        body: JSON.stringify({
          ingredients: ingredientStrings,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        `Nutrition analysis failed (${res.status})`
      );
    }

    const data = await res.json();

    return {
      calories: data.calories ?? data.totalCalories ?? 0,
      protein: data.protein ?? data.totalProtein ?? 0,
      carbs: data.carbs ?? data.totalCarbs ?? 0,
      fat: data.fat ?? data.totalFat ?? 0,
    };
  }
  async getProductCategories() {
    const data = await this.#get(`/products/categories`);

    return data.categories ?? data;
  }

  async getProductsByCategory(category) {
    const data = await this.#get(
      `/products/category/${encodeURIComponent(category)}`
    );

    return this.#toProductArray(data);
  }

  async searchProducts(query) {
    const data = await this.#get(
      `/products/search?q=${encodeURIComponent(query)}`
    );

    return this.#toProductArray(data);
  }

  async getProductByBarcode(code) {
    const data = await this.#get(
      `/products/barcode/${encodeURIComponent(code)}`
    );

    const raw = data.product ?? data;

    return new Product(raw);
  }

  #toProductArray(data) {
    const list =
      data.products ??
      data.results ??
      (Array.isArray(data) ? data : []);

    return list.map((product) => new Product(product));
  }
}




class FoodLogManager {
  static STORAGE_KEY = "nutriplan_food_log";

  static TARGETS_KEY = "nutriplan_daily_targets";

  static DEFAULT_TARGETS = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
  };

  constructor() {
    this.entries = this.#load();
    this.targets = this.#loadTargets();
  }

  #load() {
    try {
      const raw =
        JSON.parse(
          localStorage.getItem(
            FoodLogManager.STORAGE_KEY
          )
        ) || [];

      return raw.map(FoodEntry.fromJSON);
    } catch {
      return [];
    }
  }

  #save() {
    localStorage.setItem(
      FoodLogManager.STORAGE_KEY,
      JSON.stringify(this.entries)
    );
  }

  #loadTargets() {
    try {
      return {
        ...FoodLogManager.DEFAULT_TARGETS,
        ...(JSON.parse(
          localStorage.getItem(
            FoodLogManager.TARGETS_KEY
          )
        ) || {}),
      };
    } catch {
      return {
        ...FoodLogManager.DEFAULT_TARGETS,
      };
    }
  }

  setTargets(targets) {
    this.targets = {
      ...this.targets,
      ...targets,
    };

    localStorage.setItem(
      FoodLogManager.TARGETS_KEY,
      JSON.stringify(this.targets)
    );
  }

  addEntry(entry) {
    this.entries.push(entry);
    this.#save();
  }

  removeEntry(id) {
    this.entries = this.entries.filter(
      (entry) => entry.id !== id
    );

    this.#save();
  }

  get todayEntries() {
    const today = new Date().toDateString();
    return this.entries.filter(
      (entry) =>
        new Date(entry.loggedAt).toDateString() === today
    );
  }

  get todayTotals() {
    return this.todayEntries.reduce(
      (acc, entry) => ({
        calories:
          acc.calories + entry.calories,
        protein:
          acc.protein + entry.protein,
        carbs:
          acc.carbs + entry.carbs,
        fat:
          acc.fat + entry.fat,
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      }
    );
  }

  get remaining() {
    const totals = this.todayTotals;

    return {
      calories: Math.max(
        0,
        this.targets.calories - totals.calories
      ),

      protein: Math.max(
        0,
        this.targets.protein - totals.protein
      ),

      carbs: Math.max(
        0,
        this.targets.carbs - totals.carbs
      ),

      fat: Math.max(
        0,
        this.targets.fat - totals.fat
      ),
    };
  }

  get isOverCalories() {
    return (
      this.todayTotals.calories >
      this.targets.calories
    );
  }
}
class Router {
  constructor() {
    this.routes = new Map();

    window.addEventListener(
      "hashchange",
      () => this.#resolve()
    );
  }

  register(name, handler) {
    this.routes.set(name, handler);

    return this;
  }

  navigate(name, param = "") {
    const hash = param
      ? `#${name}/${param}`
      : `#${name}`;

    if (window.location.hash === hash) {
      this.#resolve();
    } else {
      window.location.hash = hash;
    }
  }

  start(defaultRoute = "home") {
    if (!window.location.hash) {
      window.location.hash = `#${defaultRoute}`;
    } else {
      this.#resolve();
    }
  }

  #resolve() {
    const [name, param] = window.location.hash
      .replace("#", "")
      .split("/");

    const handler =
      this.routes.get(name) ??
      this.routes.get("home");

    handler?.(param);
  }
}


class App {
  constructor() {
    this.api = new ApiService(
      localStorage.getItem(
        "nutriplan_usda_key"
      ) || ""
    );

    this.foodLog = new FoodLogManager();

    this.router = new Router();

    
    this.views = {
      home: new MealsView({
        api: this.api,

        onSelectMeal: (id) => {
          this.router.navigate("meal", id);
        },
      }),

      mealDetails: new MealDetailsView({
        api: this.api,

        foodLog: this.foodLog,

        onBack: () => {
          this.router.navigate("home");
        },

        onLogged: () => {
          this.#toast("Meal logged.");
        },
      }),

      foodLog: new FoodLogView({
        foodLog: this.foodLog,
      }),

      scanner: new ProductsView({
        api: this.api,

        foodLog: this.foodLog,

        onLogged: () => {
          this.#toast("Product logged.");
        },
      }),
    };

    this.#bindNav();
    this.#bindSettings();
  }


  #bindNav() {
    const navLinks =
      document.querySelectorAll(".nav-link");

    navLinks.forEach((link, index) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();

        if (index === 0) {
          this.router.navigate("home");
        }

        if (index === 1) {
          this.router.navigate("scanner");
        }

        if (index === 2) {
          this.router.navigate("foodlog");
        }
      });
    });
  }

 
  #bindSettings() {
    
    const input =
      document.getElementById("usdaKeyInput");

    const form =
      document.getElementById("settingsForm");

    if (!input || !form) {
      return;
    }

    input.value = this.api.usdaApiKey;

    form.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        this.api.setUsdaApiKey(
          input.value.trim()
        );

        this.#toast(
          "USDA API key saved."
        );
      }
    );
  }



  #setActiveView(name) {

    const sections = [
      "search-filters-section",
      "meal-categories-section",
      "all-recipes-section",
      "meal-details",
      "products-section",
      "foodlog-section",
    ];

    sections.forEach((id) => {
      const element =
        document.getElementById(id);

      if (element) {
        element.style.display = "none";
      }
    });

    if (name === "home") {
      this.#show("search-filters-section");
      this.#show("meal-categories-section");
      this.#show("all-recipes-section");
    }

    if (name === "mealDetails") {
      this.#show("meal-details");
    }

    if (name === "scanner") {
      this.#show("products-section");
    }

    if (name === "foodlog") {
      this.#show("foodlog-section");
    }

    document
      .querySelectorAll(".nav-link")
      .forEach((link) => {
        link.classList.remove(
          "bg-emerald-50",
          "text-emerald-700"
        );

        link.classList.add(
          "text-gray-600"
        );
      });

    const links =
      document.querySelectorAll(".nav-link");

    if (name === "home" && links[0]) {
      this.#activateNav(links[0]);
    }

    if (name === "scanner" && links[1]) {
      this.#activateNav(links[1]);
    }

    if (name === "foodlog" && links[2]) {
      this.#activateNav(links[2]);
    }
  }

  #show(id) {
    const element =
      document.getElementById(id);

    if (element) {
      element.style.display = "";
    }
  }

  #activateNav(link) {
    link.classList.remove(
      "text-gray-600"
    );

    link.classList.add(
      "bg-emerald-50",
      "text-emerald-700"
    );
  }

  

  #toast(message) {
    const toast =
      document.getElementById("toast");

    if (!toast) {
      console.log(message);
      return;
    }

    toast.textContent = message;

    toast.classList.add(
      "toast--visible"
    );

    clearTimeout(
      this._toastTimer
    );

    this._toastTimer = setTimeout(() => {
      toast.classList.remove(
        "toast--visible"
      );
    }, 2200);
  }



  start() {
    this.router

  
      .register("home", async () => {
        this.#setActiveView("home");

        if (!this.views.home.initialized) {
          this.views.home.initialized = true;

          try {
            await this.views.home.init();
          } catch (error) {
            console.error(
              "Home initialization error:",
              error
            );
          }
        }
      })
      .register("meal", async (id) => {
        this.#setActiveView(
          "mealDetails"
        );

        if (!id) {
          this.router.navigate("home");
          return;
        }

        try {
          await this.views.mealDetails.show(
            id
          );
        } catch (error) {
          console.error(
            "Meal details error:",
            error
          );
        }
      })

      .register("foodlog", () => {
        this.#setActiveView(
          "foodlog"
        );

        try {
          this.views.foodLog.render();
        } catch (error) {
          console.error(
            "Food log error:",
            error
          );
        }
      })

   
      .register("scanner", () => {
        this.#setActiveView(
          "scanner"
        );
      });

    this.router.start("home");
  }
}

const app = new App();

app.start();