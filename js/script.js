$(function () {
  // Executes when DOM is fully loaded

  // Hides collapsable navigation when navbar loses focus
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse("hide");
    }
  });
});

(function (global) {
  var dc = {};

  var homeHtmlUrl = "snippets/home-snippet.html";
  var allCategoriesUrl =
    "https://davids-restaurant.herokuapp.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  var menuItemsUrl =
    "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  // Inserts HTML content into a specified selector
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // Shows loading icon inside element identified by 'selector'
  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  // Substitutes '{{propName}}' with propValue in given 'string'
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
  };

  // Removes the class 'active' from home and switches to Menu button
  var switchMenuToActive = function () {
    // Remove 'active' from home button
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    // Add 'active' to menu button if not already there
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") == -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

  // Executes when DOM content is loaded
  document.addEventListener("DOMContentLoaded", function (event) {
    // Shows loading icon
    showLoading("#main-content");

    // Fetches categories from the server
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      buildAndShowHomeHTML, // Calls buildAndShowHomeHTML when data is received
      true
    ); // Specifies to get JSON from server processed into an object literal
  });

  // Builds HTML for the home page based on categories array
  function buildAndShowHomeHTML(categories) {
    // Loads home snippet page
    $ajaxUtils.sendGetRequest(
      homeHtmlUrl,
      function (homeHtml) {
        // Chooses a random category
        var chosenCategoryShortName =
          chooseRandomCategory(categories).short_name;

        // Inserts the chosen category into the home HTML snippet
        chosenCategoryShortName = "'" + chosenCategoryShortName + "'";
        var homeHtmlToInsertIntoMainPage = insertProperty(
          homeHtml,
          "randomCategoryShortName",
          chosenCategoryShortName
        );

        // Inserts the produced HTML into the main page
        insertHtml("#main-content", homeHtmlToInsertIntoMainPage);
      },
      false
    ); // No need to process JSON
  }

  // Chooses a random category from the array of category objects
  function chooseRandomCategory(categories) {
    // Chooses a random index into the array
    var randomArrayIndex = Math.floor(Math.random() * categories.length);
    // Returns category object at that index
    return categories[randomArrayIndex];
  }

  // Load the menu categories view
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
  };

  // Load the menu items view
  // 'categoryShort' is a short_name for a category
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort,
      buildAndShowMenuItemsHTML
    );
  };

  // Builds HTML for the categories page based on the data from the server
  function buildAndShowCategoriesHTML(categories) {
    // Loads title snippet of categories page
    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      function (categoriesTitleHtml) {
        // Retrieves single category snippet
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          function (categoryHtml) {
            // Switches CSS class active to menu button
            switchMenuToActive();
            // Builds categories view HTML to be inserted into page
            var categoriesViewHtml = buildCategoriesViewHtml(
              categories,
              categoriesTitleHtml,
              categoryHtml
            );
            // Inserts categories view HTML into main page
            insertHtml("#main-content", categoriesViewHtml);
          },
          false
        );
      },
      false
    );
  }

  // Builds categories view HTML to be inserted into page
  function buildCategoriesViewHtml(
    categories,
    categoriesTitleHtml,
    categoryHtml
  ) {
    var finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    // Loops over categories
    for (var i = 0; i < categories.length; i++) {
      // Inserts category values
      var html = categoryHtml;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // Builds HTML for the single category page based on the data from the server
  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    // Loads title snippet of menu items page
    $ajaxUtils.sendGetRequest(
      menuItemsTitleHtml,
      function (menuItemsTitleHtml) {
        // Retrieves single menu item snippet
        $ajaxUtils.sendGetRequest(
          menuItemHtml,
          function (menuItemHtml) {
            // Switches CSS class active to menu button
            switchMenuToActive();
            // Builds menu items view HTML to be inserted into page
            var menuItemsViewHtml = buildMenuItemsViewHtml(
              categoryMenuItems,
              menuItemsTitleHtml,
              menuItemHtml
            );
            // Inserts menu items view HTML into main page
            insertHtml("#main-content", menuItemsViewHtml);
          },
          false
        );
      },
      false
    );
  }

  // Builds menu items view HTML to be inserted into page
  function buildMenuItemsViewHtml(
    categoryMenuItems,
    menuItemsTitleHtml,
    menuItemHtml
  ) {
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "name",
      categoryMenuItems.category.name
    );
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "special_instructions",
      categoryMenuItems.category.special_instructions
    );

    var finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";

    // Loops over menu items
    var menuItems = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;
    for (var i = 0; i < menuItems.length; i++) {
      // Inserts menu item values
      var html = menuItemHtml;
      html = insertProperty(html, "short_name", menuItems[i].short_name);
      html = insertProperty(html, "catShortName", catShortName);
      html = insertItemPrice(html, "price_small", menuItems[i].price_small);
      html = insertItemPortionName(
        html,
        "small_portion_name",
        menuItems[i].small_portion_name
      );
      html = insertItemPrice(html, "price_large", menuItems[i].price_large);
      html = insertItemPortionName(
        html,
        "large_portion_name",
        menuItems[i].large_portion_name
      );
      html = insertProperty(html, "name", menuItems[i].name);
      html = insertProperty(html, "description", menuItems[i].description);

      // Adds clearfix after every second menu item
      if (i % 2 != 0) {
        html +=
          "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // Appends price with '$' if price exists
  function insertItemPrice(html, pricePropName, priceValue) {
    // If not specified, replace with empty string
    if (!priceValue) {
      return insertProperty(html, pricePropName, "");
    }

    priceValue = "$" + priceValue.toFixed(2);
    html = insertProperty(html, pricePropName, priceValue);
    return html;
  }

  // Appends portion name in parens if it exists
  function insertItemPortionName(html, portionPropName, portionValue) {
    // If not specified, return original string
    if (!portionValue) {
      return insertProperty(html, portionPropName, "");
    }

    portionValue = "(" + portionValue + ")";
    html = insertProperty(html, portionPropName, portionValue);
    return html;
  }

  // Expose dc to the global object
  global.$dc = dc;
})(window);
