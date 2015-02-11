"use strict";function isObject(value){return value===Object(value)}function makeStackTraceLong(error,promise){if(hasStacks&&promise.stack&&"object"==typeof error&&null!==error&&error.stack&&-1===error.stack.indexOf(STACK_JUMP_SEPARATOR)){for(var stacks=[],p=promise;p&&handlers.get(p);p=handlers.get(p).became)p.stack&&stacks.unshift(p.stack);stacks.unshift(error.stack);var concatedStacks=stacks.join("\n"+STACK_JUMP_SEPARATOR+"\n");error.stack=filterStackString(concatedStacks)}}function filterStackString(stackString){if(Q.isIntrospective)return stackString;for(var lines=stackString.split("\n"),desiredLines=[],i=0;i<lines.length;++i){var line=lines[i];isInternalFrame(line)||isNodeFrame(line)||!line||desiredLines.push(line)}return desiredLines.join("\n")}function isNodeFrame(stackLine){return-1!==stackLine.indexOf("(module.js:")||-1!==stackLine.indexOf("(node.js:")}function getFileNameAndLineNumber(stackLine){var attempt1=/at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);if(attempt1)return[attempt1[1],Number(attempt1[2])];var attempt2=/at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);if(attempt2)return[attempt2[1],Number(attempt2[2])];var attempt3=/.*@(.+):(\d+)$/.exec(stackLine);return attempt3?[attempt3[1],Number(attempt3[2])]:void 0}function isInternalFrame(stackLine){var fileNameAndLineNumber=getFileNameAndLineNumber(stackLine);if(!fileNameAndLineNumber)return!1;var fileName=fileNameAndLineNumber[0],lineNumber=fileNameAndLineNumber[1];return fileName===qFileName&&lineNumber>=qStartingLine&&qEndingLine>=lineNumber}function captureLine(){if(hasStacks)try{throw new Error}catch(e){var lines=e.stack.split("\n"),firstLine=lines[0].indexOf("@")>0?lines[1]:lines[2],fileNameAndLineNumber=getFileNameAndLineNumber(firstLine);if(!fileNameAndLineNumber)return;return qFileName=fileNameAndLineNumber[0],fileNameAndLineNumber[1]}}function deprecate(callback,name,alternative){return function(){return"undefined"!=typeof console&&"function"==typeof console.warn&&(alternative?console.warn(name+" is deprecated, use "+alternative+" instead.",new Error("").stack):console.warn(name+" is deprecated.",new Error("").stack)),callback.apply(this,arguments)}}function Q_getHandler(promise){var handler=handlers.get(promise);return handler&&handler.became?(handler=follow(handler),handlers.set(promise,handler),handler):handler}function follow(handler){return handler.became?(handler.became=follow(handler.became),handler.became):handler}function Q(value){return Q_isPromise(value)?value:isThenable(value)?(thenables.has(value)||thenables.set(value,new Promise(new Thenable(value))),thenables.get(value)):new Promise(new Fulfilled(value))}function Q_reject(error){return new Promise(new Rejected(error))}function defer(){var handler=new Pending,promise=new Promise(handler),deferred=new Deferred(promise);if(Q.longStackSupport&&hasStacks)try{throw new Error}catch(e){promise.stack=e.stack.substring(e.stack.indexOf("\n")+1)}return deferred}function Q_all(questions){function computeEstimate(){estimate=-1/0;for(var index=0;index<estimates.length;index++)estimates[index]>estimate&&(estimate=estimates[index])}if(Q_isPromise(questions))return"undefined"!=typeof console&&"function"==typeof console.warn&&console.warn("Q.all no longer directly unwraps a promise. Use Q(array).all()"),Q(questions).all();var setEstimate,countDown=0,deferred=defer(),answers=Array(questions.length),estimates=[],estimate=-1/0;return Array.prototype.forEach.call(questions,function(promise,index){var handler;Q_isPromise(promise)&&"fulfilled"===(handler=Q_getHandler(promise)).state?answers[index]=handler.value:(++countDown,promise=Q(promise),promise.then(function(value){answers[index]=value,0===--countDown&&deferred.resolve(answers)},deferred.reject),promise.observeEstimate(function(newEstimate){var oldEstimate=estimates[index];estimates[index]=newEstimate,newEstimate>estimate?estimate=newEstimate:oldEstimate===estimate&&estimate>=newEstimate&&computeEstimate(),estimates.length===questions.length&&estimate!==setEstimate&&(deferred.setEstimate(estimate),setEstimate=estimate)}))}),0===countDown&&deferred.resolve(answers),deferred.promise}function Q_allSettled(questions){return Q_isPromise(questions)?("undefined"!=typeof console&&"function"==typeof console.warn&&console.warn("Q.allSettled no longer directly unwraps a promise. Use Q(array).allSettled()"),Q(questions).allSettled()):Q_all(questions.map(function(promise){function regardless(){return promise.inspect()}return promise=Q(promise),promise.then(regardless,regardless)}))}function Q_spread(value,fulfilled,rejected){return Q(value).spread(fulfilled,rejected)}function Q_race(answerPs){return new Promise(function(deferred){answerPs.forEach(function(answerP){Q(answerP).then(deferred.resolve,deferred.reject)})})}function Promise_function(wrapped){return function(){for(var args=new Array(arguments.length),index=0;index<arguments.length;index++)args[index]=arguments[index];return Q(wrapped).apply(this,args)}}function Q_async(makeGenerator){return function(){function continuer(verb,arg){var iteration;try{iteration=generator[verb](arg)}catch(exception){return Q_reject(exception)}return iteration.done?Q(iteration.value):Q(iteration.value).then(callback,errback)}var generator=makeGenerator.apply(this,arguments),callback=continuer.bind(continuer,"next"),errback=continuer.bind(continuer,"throw");return callback()}}function Q_spawn(makeGenerator){Q_async(makeGenerator)().done()}function Promise(handler){if(!(this instanceof Promise))return new Promise(handler);if("function"==typeof handler){var setup=handler,deferred=defer();handler=Q_getHandler(deferred.promise);try{setup(deferred.resolve,deferred.reject,deferred.setEstimate)}catch(error){deferred.reject(error)}}handlers.set(this,handler)}function Promise_resolve(value){return Q(value)}function Q_isPromise(object){return isObject(object)&&!!handlers.get(object)}function isThenable(object){return isObject(object)&&"function"==typeof object.then}function Promise_rethrow(error){throw error}function Deferred(promise){this.promise=promise,promises.set(this,promise);var self=this,resolve=this.resolve;this.resolve=function(value){resolve.call(self,value)};var reject=this.reject;this.reject=function(error){reject.call(self,error)}}function Fulfilled(value){this.value=value,this.estimate=Date.now()}function Rejected(reason){this.reason=reason,this.estimate=1/0}function Pending(){this.messages=[],this.observers=[],this.estimate=1/0}function Thenable(thenable){this.thenable=thenable,this.became=null,this.estimate=1/0}function Passed(promise){this.promise=promise}!function(){function getUrlParameter(sParam){for(var sPageURL=window.location.search.substring(1),sURLVariables=sPageURL.split("&"),i=0;i<sURLVariables.length;i++){var sParameterName=sURLVariables[i].split("=");if(sParameterName[0]===sParam)return sParameterName[1]}}var slabs={send:function(data){"function"==typeof window.top.submitSlabData?window.top.submitSlabData(data):(alert("you have correctly sent data from your slab."),console.log(data))},getData:function(){var networkId=getUrlParameter("networkid"),outputId=getUrlParameter("outputid");if(void 0!==networkId&&void 0!==outputId)return qwest.get("/getdata/"+networkId+"/"+outputId,null,{dataType:"json",responseType:"json"});var deferred=Q.defer();return deferred.resolve(),deferred.promise},getConfigs:function(){var deferred=Q.defer();return deferred.resolve(),deferred.promise}};window.slabs=slabs}(),!function(a,b,c){"undefined"!=typeof module&&module.exports?module.exports=c:"function"==typeof define&&define.amd?define(c):a[b]=c}(this,"qwest",function(){var win=window,doc=document,before,defaultXdrResponseType="json",limit=null,requests=0,request_stack=[],getXHR=function(){return win.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP")},xhr2=""===getXHR().responseType,qwest=function(method,url,data,options,before){method=method.toUpperCase(),data=data||null,options=options||{};var nativeResponseParsing=!1,crossOrigin,xhr,xdr=!1,timeoutInterval,aborted=!1,retries=0,headers={},mimeTypes={text:"*/*",xml:"text/xml",json:"application/json",arraybuffer:null,formdata:null,document:null,file:null,blob:null},contentType="Content-Type",vars="",i,j,serialized,then_stack=[],catch_stack=[],complete_stack=[],response,success,error,func,promises={then:function(a){return options.async?then_stack.push(a):success&&a.call(xhr,response),promises},"catch":function(a){return options.async?catch_stack.push(a):error&&a.call(xhr,response),promises},complete:function(a){return options.async?complete_stack.push(a):a.call(xhr),promises}},promises_limit={then:function(a){return request_stack[request_stack.length-1].then.push(a),promises_limit},"catch":function(a){return request_stack[request_stack.length-1]["catch"].push(a),promises_limit},complete:function(a){return request_stack[request_stack.length-1].complete.push(a),promises_limit}},handleResponse=function(){if(!aborted){var i,req,p,responseType;if(--requests,clearInterval(timeoutInterval),request_stack.length){for(req=request_stack.shift(),p=qwest(req.method,req.url,req.data,req.options,req.before),i=0;func=req.then[i];++i)p.then(func);for(i=0;func=req["catch"][i];++i)p["catch"](func);for(i=0;func=req.complete[i];++i)p.complete(func)}try{if("status"in xhr&&!/^2|1223/.test(xhr.status))throw xhr.status+" ("+xhr.statusText+")";var responseText="responseText",responseXML="responseXML",parseError="parseError";if(nativeResponseParsing&&"response"in xhr&&null!==xhr.response)response=xhr.response;else if("document"==options.responseType){var frame=doc.createElement("iframe");frame.style.display="none",doc.body.appendChild(frame),frame.contentDocument.open(),frame.contentDocument.write(xhr.response),frame.contentDocument.close(),response=frame.contentDocument,doc.body.removeChild(frame)}else{if(responseType=options.responseType,"auto"==responseType)if(xdr)responseType=defaultXdrResponseType;else switch(xhr.getResponseHeader(contentType)){case mimeTypes.json:responseType="json";break;case mimeTypes.xml:responseType="xml";break;default:responseType="text"}switch(responseType){case"json":try{response="JSON"in win?JSON.parse(xhr[responseText]):eval("("+xhr[responseText]+")")}catch(e){throw"Error while parsing JSON body : "+e}break;case"xml":try{win.DOMParser?response=(new DOMParser).parseFromString(xhr[responseText],"text/xml"):(response=new ActiveXObject("Microsoft.XMLDOM"),response.async="false",response.loadXML(xhr[responseText]))}catch(e){response=void 0}if(!response||!response.documentElement||response.getElementsByTagName("parsererror").length)throw"Invalid XML";break;default:response=xhr[responseText]}}if(success=!0,p=response,options.async)for(i=0;func=then_stack[i];++i)p=func.call(xhr,p)}catch(e){if(error=!0,options.async)for(i=0;func=catch_stack[i];++i)func.call(xhr,e+" ("+url+")")}if(options.async)for(i=0;func=complete_stack[i];++i)func.call(xhr)}},buildData=function(a,b){var c,d=[],e=encodeURIComponent;if("object"==typeof a&&null!=a){for(c in a)if(a.hasOwnProperty(c)){var f=buildData(a[c],b?b+"["+c+"]":c);""!==f&&(d=d.concat(f))}}else null!=a&&null!=b&&d.push(e(b)+"="+e(a));return d.join("&")};switch(++requests,options.async="async"in options?!!options.async:!0,options.cache="cache"in options?!!options.cache:"GET"!=method,options.dataType="dataType"in options?options.dataType.toLowerCase():"post",options.responseType="responseType"in options?options.responseType.toLowerCase():"auto",options.user=options.user||"",options.password=options.password||"",options.withCredentials=!!options.withCredentials,options.timeout=options.timeout?parseInt(options.timeout,10):3e3,options.retries=options.retries?parseInt(options.retries,10):3,i=url.match(/\/\/(.+?)\//),crossOrigin=i&&i[1]?i[1]!=location.host:!1,"ArrayBuffer"in win&&data instanceof ArrayBuffer?options.dataType="arraybuffer":"Blob"in win&&data instanceof Blob?options.dataType="blob":"Document"in win&&data instanceof Document?options.dataType="document":"FormData"in win&&data instanceof FormData&&(options.dataType="formdata"),options.dataType){case"json":data=JSON.stringify(data);break;case"post":data=buildData(data)}if(options.headers){var format=function(a,b,c){return b+c.toUpperCase()};for(i in options.headers)headers[i.replace(/(^|-)([^-])/g,format)]=options.headers[i]}if(headers[contentType]||"GET"==method||(options.dataType in mimeTypes?mimeTypes[options.dataType]&&(headers[contentType]=mimeTypes[options.dataType]):headers[contentType]="application/x-www-form-urlencoded"),headers.Accept||(headers.Accept=options.responseType in mimeTypes?mimeTypes[options.responseType]:"*/*"),crossOrigin||headers["X-Requested-With"]||(headers["X-Requested-With"]="XMLHttpRequest"),"GET"==method&&(vars+=data),options.cache||(vars&&(vars+="&"),vars+="__t="+ +new Date),vars&&(url+=(/\?/.test(url)?"&":"?")+vars),limit&&requests==limit)return request_stack.push({method:method,url:url,data:data,options:options,before:before,then:[],"catch":[],complete:[]}),promises_limit;var send=function(){if(xhr=getXHR(),crossOrigin&&("withCredentials"in xhr||!win.XDomainRequest||(xhr=new XDomainRequest,xdr=!0,"GET"!=method&&"POST"!=method&&(method="POST"))),xdr?xhr.open(method,url):(xhr.open(method,url,options.async,options.user,options.password),xhr2&&options.async&&(xhr.withCredentials=options.withCredentials)),!xdr)for(var a in headers)xhr.setRequestHeader(a,headers[a]);if(xhr2&&"document"!=options.responseType)try{xhr.responseType=options.responseType,nativeResponseParsing=xhr.responseType==options.responseType}catch(b){}xhr2||xdr?xhr.onload=handleResponse:xhr.onreadystatechange=function(){4==xhr.readyState&&handleResponse()},"auto"!==options.responseType&&"overrideMimeType"in xhr&&xhr.overrideMimeType(mimeTypes[options.responseType]),before&&before.call(xhr),xdr?setTimeout(function(){xhr.send()},0):xhr.send("GET"!=method?data:null)},timeout=function(){timeoutInterval=setTimeout(function(){if(aborted=!0,xhr.abort(),options.retries&&++retries==options.retries){if(aborted=!1,error=!0,response="Timeout ("+url+")",options.async)for(i=0;func=catch_stack[i];++i)func.call(xhr,response)}else aborted=!1,timeout(),send()},options.timeout)};return timeout(),send(),promises},create=function(a){return function(b,c,d){var e=before;return before=null,qwest(a,b,c,d,e)}},obj={before:function(a){return before=a,obj},get:create("GET"),post:create("POST"),put:create("PUT"),"delete":create("DELETE"),xhr2:xhr2,limit:function(a){limit=a},setDefaultXdrResponseType:function(a){defaultXdrResponseType=a.toLowerCase()}};return obj}());var hasStacks=!1;try{throw new Error}catch(e){hasStacks=!!e.stack}var qStartingLine=captureLine(),qFileName;require("collections/shim");var WeakMap=require("collections/weak-map"),Iterator=require("collections/iterator"),asap=require("asap"),STACK_JUMP_SEPARATOR="From previous event:",handlers=new WeakMap,theViciousCycleError=new Error("Can't resolve a promise with itself"),theViciousCycleRejection=Q_reject(theViciousCycleError),theViciousCycle=Q_getHandler(theViciousCycleRejection),thenables=new WeakMap;module.exports=Q,Q.longStackSupport=!1,Q.reject=Q_reject,Q.defer=defer,Q.when=function(value,fulfilled,rejected,ms){return Q(value).then(fulfilled,rejected,ms)},Q.all=Q_all,Q.allSettled=Q_allSettled,Q.delay=function(object,timeout){return void 0===timeout&&(timeout=object,object=void 0),Q(object).delay(timeout)},Q.timeout=function(object,ms,message){return Q(object).timeout(ms,message)},Q.spread=Q_spread,Q.join=function(x,y){return Q.spread([x,y],function(x,y){if(x===y)return x;throw new Error("Can't join: not the same: "+x+" "+y)})},Q.race=Q_race,Q["try"]=function(callback){return Q(callback).dispatch("call",[[]])},Q["function"]=Promise_function,Q.promised=function(callback){return function(){for(var args=new Array(arguments.length),index=0;index<arguments.length;index++)args[index]=arguments[index];return Q_spread([this,Q_all(args)],function(self,args){return callback.apply(self,args)})}},Q.passByCopy=Q.push=function(value){return Object(value)!==value||Q_isPromise(value)||passByCopies.set(value,!0),value},Q.isPortable=function(value){return Object(value)===value&&passByCopies.has(value)};var passByCopies=new WeakMap;Q.async=Q_async,Q.spawn=Q_spawn,Q.Promise=Promise,Promise.all=Q_all,Promise.race=Q_race,Promise.resolve=Promise_resolve,Promise.reject=Q_reject,Q.isPromise=Q_isPromise,Promise.prototype.inspect=function(){return Q_getHandler(this).inspect()},Promise.prototype.isPending=function(){return"pending"===Q_getHandler(this).state},Promise.prototype.isFulfilled=function(){return"fulfilled"===Q_getHandler(this).state},Promise.prototype.isRejected=function(){return"rejected"===Q_getHandler(this).state},Promise.prototype.toBePassed=function(){return"passed"===Q_getHandler(this).state},Promise.prototype.toString=function(){return"[object Promise]"},Promise.prototype.then=function(fulfilled,rejected,ms){var _fulfilled,self=this,deferred=defer();_fulfilled="function"==typeof fulfilled?function(value){try{deferred.resolve(fulfilled.call(void 0,value))}catch(error){deferred.reject(error)}}:deferred.resolve;var _rejected;if(_rejected="function"==typeof rejected?function(error){try{deferred.resolve(rejected.call(void 0,error))}catch(newError){deferred.reject(newError)}}:deferred.reject,this.done(_fulfilled,_rejected),void 0!==ms){var updateEstimate=function(){deferred.setEstimate(self.getEstimate()+ms)};this.observeEstimate(updateEstimate),updateEstimate()}return deferred.promise},Promise.prototype.done=function(fulfilled,rejected){var self=this,done=!1;asap(function(){var _fulfilled;"function"==typeof fulfilled&&(_fulfilled=Q.onerror?function(value){if(!done){done=!0;try{fulfilled.call(void 0,value)}catch(error){(Q.onerror||Promise_rethrow)(error)}}}:function(value){done||(done=!0,fulfilled.call(void 0,value))});var _rejected;_rejected="function"==typeof rejected&&Q.onerror?function(error){if(!done){done=!0,makeStackTraceLong(error,self);try{rejected.call(void 0,error)}catch(newError){(Q.onerror||Promise_rethrow)(newError)}}}:"function"==typeof rejected?function(error){done||(done=!0,makeStackTraceLong(error,self),rejected.call(void 0,error))}:Q.onerror||Promise_rethrow,"object"==typeof process&&process.domain&&(_rejected=process.domain.bind(_rejected)),Q_getHandler(self).dispatch(_fulfilled,"then",[_rejected])})},Promise.prototype.thenResolve=function(value){return value=Q(value),Q_all([this,value]).then(function(){return value},null,0)},Promise.prototype.thenReject=function(error){return this.then(function(){throw error},null,0)},Promise.prototype.all=function(){return this.then(Q_all)},Promise.prototype.allSettled=function(){return this.then(Q_allSettled)},Promise.prototype["catch"]=function(rejected){return this.then(void 0,rejected)},Promise.prototype["finally"]=function(callback,ms){return callback?(callback=Q(callback),this.then(function(value){return callback.call().then(function(){return value})},function(reason){return callback.call().then(function(){throw reason})},ms)):this},Promise.prototype.observeEstimate=function(emit){return this.rawDispatch(null,"estimate",[emit]),this},Promise.prototype.getEstimate=function(){return Q_getHandler(this).estimate},Promise.prototype.dispatch=function(op,args){var deferred=defer();return this.rawDispatch(deferred.resolve,op,args),deferred.promise},Promise.prototype.rawDispatch=function(resolve,op,args){var self=this;asap(function(){Q_getHandler(self).dispatch(resolve,op,args)})},Promise.prototype.get=function(name){return this.dispatch("get",[name])},Promise.prototype.invoke=function(name){for(var args=new Array(arguments.length-1),index=1;index<arguments.length;index++)args[index-1]=arguments[index];return this.dispatch("invoke",[name,args])},Promise.prototype.apply=function(thisp,args){return this.dispatch("call",[args,thisp])},Promise.prototype.call=function(thisp){for(var args=new Array(Math.max(0,arguments.length-1)),index=1;index<arguments.length;index++)args[index-1]=arguments[index];return this.dispatch("call",[args,thisp])},Promise.prototype.bind=function(thisp){for(var self=this,args=new Array(Math.max(0,arguments.length-1)),index=1;index<arguments.length;index++)args[index-1]=arguments[index];return function(){for(var boundArgs=args.slice(),index=0;index<arguments.length;index++)boundArgs[boundArgs.length]=arguments[index];return self.dispatch("call",[boundArgs,thisp])}},Promise.prototype.keys=function(){return this.dispatch("keys",[])},Promise.prototype.iterate=function(){return this.dispatch("iterate",[])},Promise.prototype.spread=function(fulfilled,rejected,ms){return this.all().then(function(array){return fulfilled.apply(void 0,array)},rejected,ms)},Promise.prototype.timeout=function(ms,message){var deferred=defer(),timeoutId=setTimeout(function(){deferred.reject(new Error(message||"Timed out after "+ms+" ms"))},ms);return this.then(function(value){clearTimeout(timeoutId),deferred.resolve(value)},function(error){clearTimeout(timeoutId),deferred.reject(error)}),deferred.promise},Promise.prototype.delay=function(ms){return this.then(function(value){var deferred=defer();return deferred.setEstimate(Date.now()+ms),setTimeout(function(){deferred.resolve(value)},ms),deferred.promise},null,ms)},Promise.prototype.pull=function(){return this.dispatch("pull",[])},Promise.prototype.pass=function(){return this.toBePassed()?this:new Promise(new Passed(this))};var promises=new WeakMap;Deferred.prototype.resolve=function(value){var handler=Q_getHandler(promises.get(this));handler.messages&&handler.become(Q(value))},Deferred.prototype.reject=function(reason){var handler=Q_getHandler(promises.get(this));handler.messages&&handler.become(Q_reject(reason))},Deferred.prototype.setEstimate=function(estimate){if(estimate=+estimate,estimate!==estimate&&(estimate=1/0),1e12>estimate&&estimate!==-1/0)throw new Error("Estimate values should be a number of miliseconds in the future");var handler=Q_getHandler(promises.get(this));handler.setEstimate&&handler.setEstimate(estimate)},Fulfilled.prototype.state="fulfilled",Fulfilled.prototype.inspect=function(){return{state:"fulfilled",value:this.value}},Fulfilled.prototype.dispatch=function(resolve,op,operands){var result;if("then"===op||"get"===op||"call"===op||"invoke"===op||"keys"===op||"iterate"===op||"pull"===op)try{result=this[op].apply(this,operands)}catch(exception){result=Q_reject(exception)}else if("estimate"===op)operands[0].call(void 0,this.estimate);else{var error=new Error("Fulfilled promises do not support the "+op+" operator");result=Q_reject(error)}resolve&&resolve(result)},Fulfilled.prototype.then=function(){return this.value},Fulfilled.prototype.get=function(name){return this.value[name]},Fulfilled.prototype.call=function(args,thisp){return this.callInvoke(this.value,args,thisp)},Fulfilled.prototype.invoke=function(name,args){return this.callInvoke(this.value[name],args,this.value)},Fulfilled.prototype.callInvoke=function(callback,args,thisp){for(var waitToBePassed,index=0;index<args.length;index++)Q_isPromise(args[index])&&args[index].toBePassed()&&(waitToBePassed=waitToBePassed||[],waitToBePassed.push(args[index]));if(waitToBePassed){var self=this;return Q_all(waitToBePassed).then(function(){return self.callInvoke(callback,args.map(function(arg){return Q_isPromise(arg)&&arg.toBePassed()?arg.inspect().value:arg}),thisp)})}return callback.apply(thisp,args)},Fulfilled.prototype.keys=function(){return Object.keys(this.value)},Fulfilled.prototype.iterate=function(){return new Iterator(this.value)},Fulfilled.prototype.pull=function(){var result;if(Object(this.value)===this.value){result=Array.isArray(this.value)?[]:{};for(var name in this.value)result[name]=this.value[name]}else result=this.value;return Q.push(result)},Rejected.prototype.state="rejected",Rejected.prototype.inspect=function(){return{state:"rejected",reason:this.reason}},Rejected.prototype.dispatch=function(resolve,op,operands){var result;result="then"===op?this.then(resolve,operands[0]):this,resolve&&resolve(result)},Rejected.prototype.then=function(resolve,rejected){return rejected?rejected(this.reason):this},Pending.prototype.state="pending",Pending.prototype.inspect=function(){return{state:"pending"}},Pending.prototype.dispatch=function(resolve,op,operands){if(this.messages.push([resolve,op,operands]),"estimate"===op){this.observers.push(operands[0]);var self=this;asap(function(){operands[0].call(void 0,self.estimate)})}},Pending.prototype.become=function(promise){this.became=theViciousCycle;var handler=Q_getHandler(promise);this.became=handler,handlers.set(promise,handler),this.promise=void 0,this.messages.forEach(function(message){asap(function(){var handler=Q_getHandler(promise);handler.dispatch.apply(handler,message)})}),this.messages=void 0,this.observers=void 0},Pending.prototype.setEstimate=function(estimate){if(this.observers){var self=this;self.estimate=estimate,this.observers.forEach(function(observer){asap(function(){observer.call(void 0,estimate)})})}},Thenable.prototype.state="thenable",Thenable.prototype.inspect=function(){return{state:"pending"}},Thenable.prototype.cast=function(){if(!this.became){var deferred=defer(),thenable=this.thenable;asap(function(){try{thenable.then(deferred.resolve,deferred.reject)}catch(exception){deferred.reject(exception)}}),this.became=Q_getHandler(deferred.promise)}return this.became},Thenable.prototype.dispatch=function(resolve,op,args){this.cast().dispatch(resolve,op,args)},Passed.prototype.state="passed",Passed.prototype.inspect=function(){return this.promise.inspect()},Passed.prototype.dispatch=function(resolve,op,args){return this.promise.rawDispatch(resolve,op,args)},Q.ninvoke=function(object,name){for(var args=new Array(Math.max(0,arguments.length-1)),index=2;index<arguments.length;index++)args[index-2]=arguments[index];var deferred=Q.defer();return args[index-2]=deferred.makeNodeResolver(),Q(object).dispatch("invoke",[name,args])["catch"](deferred.reject),deferred.promise},Promise.prototype.ninvoke=function(name){for(var args=new Array(arguments.length),index=1;index<arguments.length;index++)args[index-1]=arguments[index];var deferred=Q.defer();return args[index-1]=deferred.makeNodeResolver(),this.dispatch("invoke",[name,args])["catch"](deferred.reject),deferred.promise},Q.denodeify=function(callback,pattern){return function(){for(var args=new Array(arguments.length+1),index=0;index<arguments.length;index++)args[index]=arguments[index];var deferred=Q.defer();return args[index]=deferred.makeNodeResolver(pattern),Q(callback).apply(this,args)["catch"](deferred.reject),deferred.promise}},Deferred.prototype.makeNodeResolver=function(unpack){var resolve=this.resolve;return unpack===!0?function(error){if(error)resolve(Q_reject(error));else{for(var value=new Array(Math.max(0,arguments.length-1)),index=1;index<arguments.length;index++)value[index-1]=arguments[index];resolve(value)}}:unpack?function(error){if(error)resolve(Q_reject(error));else{var value={};for(var index in unpack)value[unpack[index]]=arguments[index+1];resolve(value)}}:function(error,value){resolve(error?Q_reject(error):value)}},Promise.prototype.nodeify=function(nodeback){return nodeback?void this.done(function(value){nodeback(null,value)},nodeback):this},Q.nextTick=deprecate(asap,"nextTick","asap package"),Q.resolve=deprecate(Q,"resolve","Q"),Q.fulfill=deprecate(Q,"fulfill","Q"),Q.isPromiseAlike=deprecate(isThenable,"isPromiseAlike","(not supported)"),Q.fail=deprecate(function(value,rejected){return Q(value)["catch"](rejected)},"Q.fail","Q(value).catch"),Q.fin=deprecate(function(value,regardless){return Q(value)["finally"](regardless)},"Q.fin","Q(value).finally"),Q.progress=deprecate(function(value){return value},"Q.progress","no longer supported"),Q.thenResolve=deprecate(function(promise,value){return Q(promise).thenResolve(value)},"thenResolve","Q(value).thenResolve"),Q.thenReject=deprecate(function(promise,reason){return Q(promise).thenResolve(reason)},"thenResolve","Q(value).thenResolve"),Q.isPending=deprecate(function(value){return Q(value).isPending()},"isPending","Q(value).isPending"),Q.isFulfilled=deprecate(function(value){return Q(value).isFulfilled()},"isFulfilled","Q(value).isFulfilled"),Q.isRejected=deprecate(function(value){return Q(value).isRejected()},"isRejected","Q(value).isRejected"),Q.master=deprecate(function(value){return value},"master","no longer necessary"),Q.makePromise=function(){throw new Error("makePromise is no longer supported")},Q.dispatch=deprecate(function(value,op,operands){return Q(value).dispatch(op,operands)},"dispatch","Q(value).dispatch"),Q.get=deprecate(function(object,name){return Q(object).get(name)},"get","Q(value).get"),Q.keys=deprecate(function(object){return Q(object).keys()},"keys","Q(value).keys"),Q.post=deprecate(function(object,name,args){return Q(object).post(name,args)},"post","Q(value).invoke (spread arguments)"),Q.mapply=deprecate(function(object,name,args){return Q(object).post(name,args)},"post","Q(value).invoke (spread arguments)"),Q.send=deprecate(function(object,name){return Q(object).post(name,Array.prototype.slice.call(arguments,2))},"send","Q(value).invoke"),Q.set=function(){throw new Error("Q.set no longer supported")},Q["delete"]=function(){throw new Error("Q.delete no longer supported")},Q.nearer=deprecate(function(value){return Q_isPromise(value)&&value.isFulfilled()?value.inspect().value:value},"nearer","inspect().value (+nuances)"),Q.fapply=deprecate(function(callback,args){return Q(callback).dispatch("call",[args])},"fapply","Q(callback).apply(thisp, args)"),Q.fcall=deprecate(function(callback){return Q(callback).dispatch("call",[Array.prototype.slice.call(arguments,1)])},"fcall","Q(callback).call(thisp, ...args)"),Q.fbind=deprecate(function(object){var promise=Q(object),args=Array.prototype.slice.call(arguments,1);return function(){return promise.dispatch("call",[args.concat(Array.prototype.slice.call(arguments)),this])}},"fbind","bind with thisp"),Q.promise=deprecate(Promise,"promise","Promise"),Promise.prototype.fapply=deprecate(function(args){return this.dispatch("call",[args])},"fapply","apply with thisp"),Promise.prototype.fcall=deprecate(function(){return this.dispatch("call",[Array.prototype.slice.call(arguments)])},"fcall","try or call with thisp"),Promise.prototype.fail=deprecate(function(rejected){return this["catch"](rejected)},"fail","catch"),Promise.prototype.fin=deprecate(function(regardless){return this["finally"](regardless)},"fin","finally"),Promise.prototype.set=function(){throw new Error("Promise set no longer supported")},Promise.prototype["delete"]=function(){throw new Error("Promise delete no longer supported")},Deferred.prototype.notify=deprecate(function(){},"notify","no longer supported"),Promise.prototype.progress=deprecate(function(){return this},"progress","no longer supported"),Promise.prototype.mapply=deprecate(function(name,args){return this.dispatch("invoke",[name,args])},"mapply","invoke"),Promise.prototype.fbind=deprecate(function(){return Q.fbind.apply(Q,[void 0].concat(Array.prototype.slice.call(arguments)))},"fbind","bind(thisp, ...args)"),Promise.prototype.send=deprecate(function(){return this.dispatch("invoke",[name,Array.prototype.slice.call(arguments,1)])},"send","invoke"),Promise.prototype.mcall=deprecate(function(){return this.dispatch("invoke",[name,Array.prototype.slice.call(arguments,1)])},"mcall","invoke"),Promise.prototype.passByCopy=deprecate(function(value){return value},"passByCopy","Q.passByCopy"),Q.nfapply=deprecate(function(callback,args){var deferred=Q.defer(),nodeArgs=Array.prototype.slice.call(args);return nodeArgs.push(deferred.makeNodeResolver()),Q(callback).apply(this,nodeArgs)["catch"](deferred.reject),deferred.promise},"nfapply"),Promise.prototype.nfapply=deprecate(function(args){return Q.nfapply(this,args)},"nfapply"),Q.nfcall=deprecate(function(callback){var args=Array.prototype.slice.call(arguments,1);return Q.nfapply(callback,args)},"nfcall"),Promise.prototype.nfcall=deprecate(function(){for(var args=new Array(arguments.length),index=0;index<arguments.length;index++)args[index]=arguments[index];
return Q.nfapply(this,args)},"nfcall"),Q.nfbind=deprecate(function(callback){var baseArgs=Array.prototype.slice.call(arguments,1);return function(){var nodeArgs=baseArgs.concat(Array.prototype.slice.call(arguments)),deferred=Q.defer();return nodeArgs.push(deferred.makeNodeResolver()),Q(callback).apply(this,nodeArgs)["catch"](deferred.reject),deferred.promise}},"nfbind","denodeify (with caveats)"),Promise.prototype.nfbind=deprecate(function(){for(var args=new Array(arguments.length),index=0;index<arguments.length;index++)args[index]=arguments[index];return Q.nfbind(this,args)},"nfbind","denodeify (with caveats)"),Q.nbind=deprecate(function(callback,thisp){var baseArgs=Array.prototype.slice.call(arguments,2);return function(){function bound(){return callback.apply(thisp,arguments)}var nodeArgs=baseArgs.concat(Array.prototype.slice.call(arguments)),deferred=Q.defer();return nodeArgs.push(deferred.makeNodeResolver()),Q(bound).apply(this,nodeArgs)["catch"](deferred.reject),deferred.promise}},"nbind","denodeify (with caveats)"),Q.npost=deprecate(function(object,name,nodeArgs){var deferred=Q.defer();return nodeArgs.push(deferred.makeNodeResolver()),Q(object).dispatch("invoke",[name,nodeArgs])["catch"](deferred.reject),deferred.promise},"npost","ninvoke (with spread arguments)"),Promise.prototype.npost=deprecate(function(name,args){return Q.npost(this,name,args)},"npost","Q.ninvoke (with caveats)"),Q.nmapply=deprecate(Q.nmapply,"nmapply","q/node nmapply"),Promise.prototype.nmapply=deprecate(Promise.prototype.npost,"nmapply","Q.nmapply"),Q.nsend=deprecate(Q.ninvoke,"nsend","q/node ninvoke"),Q.nmcall=deprecate(Q.ninvoke,"nmcall","q/node ninvoke"),Promise.prototype.nsend=deprecate(Promise.prototype.ninvoke,"nsend","q/node ninvoke"),Promise.prototype.nmcall=deprecate(Promise.prototype.ninvoke,"nmcall","q/node ninvoke");var qEndingLine=captureLine();