Ext.data.JsonP.getListItemsByKey({"tagname":"class","name":"getListItemsByKey","autodetected":{},"files":[{"filename":"FormActions.js","href":"FormActions.html#getListItemsByKey"}],"params":[{"tagname":"params","type":"String","name":"listTitle","doc":"<p>The SharePoint list needs to query</p>\n","html_type":"String"},{"tagname":"params","type":"String","name":"keyColName","doc":"<p>The information query column</p>\n","html_type":"String"},{"tagname":"params","type":"String/Number/Boolean","name":"keyField","doc":"<p>The information needs to query with</p>\n","html_type":"String/Number/Boolean"},{"tagname":"params","type":"String[]","name":"queryFields","doc":"<p>The information needs to query out</p>\n","html_type":"String[]"},{"tagname":"params","type":"Function","name":"callback","doc":"<p>The callback function once query succeeded</p>\n","html_type":"Function"}],"return":{"type":"Object","name":"return","doc":"<p>collListItem is the return data, requires onQuerySuccedded function handel first</p>\n\n<h1>See the example:</h1>\n\n<pre><code>getListItemsByKey('list', 'ID', 1, ['Title', 'Column'], function(){\n    doSomething;\n});\n</code></pre>\n","properties":null,"html_type":"Object"},"members":[{"name":"onQueryFailed","tagname":"method","owner":"getListItemsByKey","id":"method-onQueryFailed","meta":{}},{"name":"onQuerySucceded","tagname":"method","owner":"getListItemsByKey","id":"method-onQuerySucceded","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-getListItemsByKey","short_doc":"This is the very important function to retrieve data from a specific list with key value ...","classIcon":"icon-class","superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/FormActions.html#getListItemsByKey' target='_blank'>FormActions.js</a></div></pre><div class='doc-contents'><h1>This is the very important function to retrieve data from a specific list with key value</h1>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>listTitle</span> : String<div class='sub-desc'><p>The SharePoint list needs to query</p>\n</div></li><li><span class='pre'>keyColName</span> : String<div class='sub-desc'><p>The information query column</p>\n</div></li><li><span class='pre'>keyField</span> : String/Number/Boolean<div class='sub-desc'><p>The information needs to query with</p>\n</div></li><li><span class='pre'>queryFields</span> : String[]<div class='sub-desc'><p>The information needs to query out</p>\n</div></li><li><span class='pre'>callback</span> : Function<div class='sub-desc'><p>The callback function once query succeeded</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>collListItem is the return data, requires onQuerySuccedded function handel first</p>\n\n<h1>See the example:</h1>\n\n<pre><code>getListItemsByKey('list', 'ID', 1, ['Title', 'Column'], function(){\n    doSomething;\n});\n</code></pre>\n</div></li></ul></div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-onQueryFailed' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='getListItemsByKey'>getListItemsByKey</span><br/><a href='source/FormActions.html#getListItemsByKey-method-onQueryFailed' target='_blank' class='view-source'>view source</a></div><a href='#!/api/getListItemsByKey-method-onQueryFailed' class='name expandable'>onQueryFailed</a>( <span class='pre'>args</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Execute if getListItemsByKey failed ...</div><div class='long'><p>Execute if <a href=\"#!/api/getListItemsByKey\" rel=\"getListItemsByKey\" class=\"docClass\">getListItemsByKey</a> failed</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>args</span> : Object<div class='sub-desc'><p>The error message object</p>\n</div></li></ul></div></div></div><div id='method-onQuerySucceded' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='getListItemsByKey'>getListItemsByKey</span><br/><a href='source/FormActions.html#getListItemsByKey-method-onQuerySucceded' target='_blank' class='view-source'>view source</a></div><a href='#!/api/getListItemsByKey-method-onQuerySucceded' class='name expandable'>onQuerySucceded</a>( <span class='pre'></span> ) : String[]<span class=\"signature\"></span></div><div class='description'><div class='short'>Execute if getListItemsByKey succeeded, callback function inheritance from getListItemsByKey ...</div><div class='long'><p>Execute if getListItemsByKey succeeded, callback function inheritance from <a href=\"#!/api/getListItemsByKey\" rel=\"getListItemsByKey\" class=\"docClass\">getListItemsByKey</a></p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>String[]</span><div class='sub-desc'><p>Return all list items contents</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});