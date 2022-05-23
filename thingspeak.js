var channelID = 1720573
var readAPIKey = 'X5XJYOKT946HVAON'
var writeAPIKey = 'VXBWB3AIXRLLSC10'

function createProductObj(name, importFieldName, importFieldId, exportFieldName, exportFieldId) {
	return {
		'name': name,

		'importValue': 0,
		'importChartData': [],
		'importFieldName': importFieldName,
		'importFieldId': importFieldId,

		'exportValue': 0,
		'exportChartData': [],
		'exportFieldName': exportFieldName,
		'exportFieldId': exportFieldId,

		'stored': 0
	}
}

var products = [
	createProductObj('milk-1', 'field1', 1, 'field2', 2),
	createProductObj('milk-2', 'field3', 3, 'field4', 4),
	createProductObj('milk-3', 'field5', 5, 'field6', 6)
]





function findProduct(handle, productName) {

	for (var i = 0; i < products.length; i++) {
		if (products[i].name === productName) {

			if (handle == null) {
				return products[i]
			} else {
				handle(products[i])
			}

		}
	}

}



function fetchProduct(handle) {
	
	for (var i = 0; i < products.length; i++) {

		products[i].importValue = 0
		products[i].exportValue = 0
		
		products[i].importChartData.length = 0
		products[i].exportChartData.length = 0
	}

	makeRequest(function(res) {

		var feedsObj = JSON.parse(res).feeds
				
		feedsObj.forEach(function(feed) {
			
			//console.log(feed)
			
			for (var i = 0; i < products.length; i++) {
								
				var importValue = feed[products[i].importFieldName]
				var exportValue = feed[products[i].exportFieldName]
				
				//console.log(importValue, exportValue)
				
				products[i].importValue += importValue == null ? 0 : parseInt(importValue)
				products[i].exportValue += exportValue == null ? 0 : parseInt(exportValue)
				
				if (importValue != null) {
					products[i].importChartData.push({'timestamp': feed.created_at, 'value': parseInt(importValue)})
				} 
				
				else if (exportValue != null) {
					products[i].exportChartData.push({'timestamp': feed.created_at, 'value': parseInt(exportValue)})
				} 
				
				
				products[i].stored = products[i].importValue - products[i].exportValue
			}
		})
				
		handle()

	}, 'GET', `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}`)
}

function sendProduct(handle, fieldName, value) {
	
	makeRequest(function(res) {
		handle()
		
	}, 'POST', `https://api.thingspeak.com/update?api_key=${writeAPIKey}&${fieldName}=${value}`)
}


// function sendProduct(handle) {
// 
// 	// build json string
// 	var sendObj = `{"write_api_key":"${writeAPIKey}","updates":[{"created_at":"${new Date().toISOString()}"`
// 	products.forEach(function(product) {
// 		sendObj += `,"${product.importFieldName}":${product.importValue}`
// 		sendObj += `,"${product.exportFieldName}":${product.exportValue}`
// 	})
// 	sendObj += `}]}`
// 
// 	// http post
// 	var xhr = new XMLHttpRequest()
// 
// 	xhr.open('POST', `https://api.thingspeak.com/channels/${channelID}/bulk_update.json`)
// 	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
// 
// 	xhr.onload = function() {
// 		if (this.status >= 200 && this.status < 300) {
// 			handle()
// 		} else {
// 			console.error('error with html resquest')
// 		}
// 	}
// 
// 	xhr.send(sendObj)
// }









function makeRequest(handle, method, url) {

	var xhr = new XMLHttpRequest()

	xhr.open(method, url)

	xhr.onload = function() {
		if (this.status >= 200 && this.status < 300) {
			handle(xhr.responseText)
		} else {
			console.error('error with html resquest: ', method)
		}
	}

	xhr.send()

}
