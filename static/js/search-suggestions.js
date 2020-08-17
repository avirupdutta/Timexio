const search = instantsearch({
	appId: "TPOSGJH6ZQ",
	apiKey: "68b9b5bfaed76755f36e9b6bf7cc0721",
	indexName: "products",
	urlSync: true,
	numericFilters: [
		'quantity > 0'
	],
	searchFunction: function(helper) {
		var searchResults = $("#hits");
		if (helper.state.query === "") {
			searchResults.hide();
			return;
		}
		helper.search();
		searchResults.show();
    }
});

search.addWidget(
	instantsearch.widgets.searchBox({
		container: "#search-input"
	})
);

search.addWidget(
	instantsearch.widgets.hits({
		container: "#hits",
		hitsPerPage: 5,
		templates: {
			item: `
				<a href="/product/{{_id.$oid}}/details">
                    <div class="hit aa-suggestions-category p-3 border-bottom">
                        <div class="hit-content">
							<p class="hit-price">
								<span class="flaticon-search mr-2"></span>
								<span class="search-highlight-text text-dark">{{{_highlightResult.name.value}}}</span>
							</p>
                        </div>
                    </div>
                </a>`,
			empty: ""
        }
	})
);

search.start();