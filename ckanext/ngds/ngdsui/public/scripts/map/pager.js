ngds.Pager = function(rows) {
	var start = 0;
	var rows = rows;
	var num_pages = 0;
	var pager_div = $(".pager");
	var me = this;
	var handler = null;

	var preamble = $(".preamble");
	this.set_state = function(count,query) {

		preamble.empty();
		preamble.text("Found $1 results for \"$2\"".replace("$1",count).replace("$2",query));
	};

	this.set_action = function(action, params) {
		(function() {
			if(typeof action !== 'function') {
				throw "Expected a function";
			}
		})();

		me._action = action;
		me._params = params;
	};

	var construct_anchor = function(i) {
		var anchor = $("<a/>",{class:"page-num"});
		anchor.text(i);
		return anchor;
	};

	var initialize_pages_ui = function(n) {
		for(var i=1;i<n+1;i++) {
			pager_div.append(construct_anchor(i));
		}
		$(".page-num").click(function(ev){
			var page_number = ev.target.firstChild.data;
			me.next(handler);
		});
	};

	var clear_results_div = function() {
		$(".results").empty();
	};

	this.next = function(fn) {
		handler = fn;
		console.log(fn);

		if(start>(num_pages*rows+1)) {
			console.log("returning");
			return;
		}

		var params = me._params;
		params['rows'] = rows;
		params['start'] = start;

		me._action(params,function(response){
			var result = ngds.SearchResult(response.result);
			num_pages = Math.ceil(result.get('count')/rows);
			
			clear_results_div();
			var results_div = $(".results");

			var results = response.result.results;

			for(var i=0;i<results.length;i++){
				var each_result = $("<div/>",{class:"result"});
				each_result.text(results[i]['title']);
				results_div.append(each_result);
			}

			if($('.page-num').length==0) {
				initialize_pages_ui(num_pages);
			}
			return fn(result);
		});

		start = start + rows;
	};


	return {
		'set_state':this.set_state,
		'set_action':this.set_action,
		'next':this.next,
		'is_defined':this.is_defined
	};
};