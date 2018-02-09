const express = require('express');
const request = require("request");
const router = express.Router();
const fs = require ("fs");
const jsonfile = require("jsonfile");
const reportsArray = ['/1',/*'/2',*/'/3','/4','/5','/6','/11'];

router.get('/:reportIndex', function getAll(req, res) {
	res.setHeader('content-type', 'application/json') 
//  var url = require('url');
//  var pathname = url.parse(req.url).pathname;
//  var indexParameter = pathname.split("/"); 
//  var indexParameter = pathname.split("/"); 

//testing comment
//
	var reportIndex = request.params.reportIndex
	console.log(reportIndex)
	reportIndex = parseInt( reportIndex, 10 )
	
    fs.readFile("./config/property.json",'utf8',(err,data)=>{
		if(err)  { 
				console.error(err)	
				return res.status(500).json({message:"Load error - Unable to load Filter config file: "+err})   
			}			
		try      {  var obj=JSON.parse(data)   }
		catch(e) {  
				console.error(e)  
				return res.status(500).json({message:"Load error - Unable to load Filter config: "+e})
		}	
	try{
		var sortedobj=obj.reports
		sortedobj.sort(function(a, b) {
    		return a.reportIndex > b.reportIndex;
		});
		sortedobj.sort();
		var flag=0
		for (var index = 0; index < sortedobj.length && flag==0 ; index++) {
				if (sortedobj[index].reportIndex==reportIndex)	{var getobj=sortedobj[index];flag=1;}
		}
		if( flag==1 ){
			return res.status(200).send(JSON.stringify(getobj,null,4))
		}
		else{
		    return res.status(404).json({message:"Fetch error - Report definition not found in Filter config file"})
		}
	}
	catch(e) {  
				console.error(e)  
				return res.status(500).json({message:"Unexpected error: "+e})
		}
	})    
})

router.post("/", function postAll(req, res) {
	res.setHeader('content-type', 'application/json')
    var reportIndex = req.body.reportIndex;
    var reportInd = parseInt( reportIndex, 10 )
   
    fs.readFile("./config/property.json",'utf8',(err,data)=>{
		if(err)  { 
				console.error(err)
				return res.status(500).json({message:"Load error - Unable to load Filter config file: "+err}) 
				}			
		try{  
			var obj=JSON.parse(data)  
			var newobj=obj.reports
			var flag=0
			for (var index = 0; index < newobj.length && flag==0; index++) {
				if (newobj[index].reportIndex==reportInd)	{flag=1;}
			}
			if( flag==1 ){
				return res.status(404).json({message:"Create error - Report config already exists. Please use put method to update"}) 
			}
			else{
				obj['reports'].push(req.body);
				newobj= obj.reports
				newobj.sort(function(a, b) {
    				return a.reportIndex > b.reportIndex;
				});
				newobj.sort();
				obj.reports = newobj
		    }
		}
		catch(e) { 
			console.error(e) 
    			return res.status(500).json({message:"Create error - Unable to update Filter config file"+e}) 
		}	
		
		try{
				fs.writeFile("./config/property.json",JSON.stringify(obj,null,4),(err)=>{
					if(err){ console.error(err) 
							return res.status(500).json({message:"Unexpected error during Filter config file write"+err})
						}
					return res.status(200).send(JSON.stringify(obj,null,4))
		    		}) 
			}
		catch(e){ 
			return res.status(500).json({message:"Unexpected error during Filter config file write"+e})
			}
		
	})    
})
    
var updateReportConfig = function updateReportConfig(configData, reportIndex, res){
	res.setHeader('content-type', 'application/json');
    var reportInd = parseInt( reportIndex, 10 )
    fs.readFile("./config/property.json",'utf8',(err,data)=>{
		if(err)  { 
				console.error(err)    
				res.status(500).json({message:"Load error - Unable to load Filter config file"});res.end();
				return   
		}			
		try{ 
				var obj=JSON.parse(data) 
				var newobj=obj.reports
				newobj.sort(function(a, b) {
    				return a.reportIndex > b.reportIndex;
				});
				newobj.sort();
				var checkflag=0
				for (var index = 0; index < newobj.length && checkflag==0 ; index++) {
					if (newobj[index].reportIndex==reportInd)	{reportInd=index;checkflag=1;}
				}
				if( checkflag==0 ){
		    		return res.status(404).json({message:"Fetch error - Report definition not found in Filter config file. Please use post method to create"})
				}
				obj.reports = newobj
		} 
		catch(e) { console.error(e)         }
		if(checkflag==1){
	    try{
	    	var flag=0
			if ( typeof(configData.filtersInclude) != "undefined" && Object.keys(configData.filtersInclude).length != 0 ){
				 obj.reports[reportInd]["filtersInclude"]= configData.filtersInclude;	flag = flag + 1;
				 }
			else if (typeof(configData.filtersInclude) == "undefined")  {}//console.log("no filter include parameters sent for update")
			else {	
				obj.reports[reportInd]["filtersInclude"]=new Array(); flag = flag + 1;
				}
			}
		catch(e){	res.status(500).json({message:"unexpected error during filter include parameters update: " + e});  res.end();  
			return
			}
	    try{
			if ( typeof(configData.filtersExclude) != "undefined" && Object.keys(configData.filtersExclude).length != 0 ){
				 obj.reports[reportInd]["filtersExclude"]= configData.filtersExclude;
				 flag = flag + 1;
				 }
			else if (typeof(configData.filtersExclude) == "undefined") {}//console.log("no filter exclude parameters sent for update")	
			else {	
				obj.reports[reportInd]["filtersExclude"]=new Array();	flag = flag + 1;	       
				}	
			}
		catch(e){	res.status(500).json({message:"unexpected error during filter exclude parameters update: " + e}); res.end();  
			return
			}		
		try{
			if(flag > 0){
				fs.writeFile("./config/property.json",JSON.stringify(obj,null,4),(err)=>{
					if(err){ 
							console.error(err) 
							res.status(500).json({message:"Unexpected error during Filter config file write"+err});res.end();
						}
					res.status(200).json({message:"Filter config file successfully updated"});res.end();
					return
		    		}) 
		    	}
		    else{ res.status(200).json({message:"Nothing to update in Filter config file"});res.end();
		    	return
		    	}
			}
		catch(e){ res.status(500).json({message:"Unexpected error during Filter config file write"+e});res.end();
		    return
			}
		}	
    }) 
}

router.put(reportsArray, function putAll(req, res, next) {
	try{
    	var configData=req.body;
    	var url = require('url');
    	var pathname = url.parse(req.url).pathname;
    	var indexParameter = pathname.split("/"); 
    	updateReportConfig(configData,indexParameter[1],res)
    }
    catch(e){ 
		res.status(500).json({message:"Unexpected error during Filter config file write"+e});res.end();
		return
	}
})

module.exports = router;