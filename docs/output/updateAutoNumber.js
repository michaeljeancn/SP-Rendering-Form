Ext.data.JsonP.updateAutoNumber({"tagname":"class","name":"updateAutoNumber","autodetected":{},"files":[{"filename":"FormActions.js","href":"FormActions.html#updateAutoNumber"}],"params":[{"tagname":"params","type":"String","name":"listTitle","doc":"<blockquote><p>Target SharePoint list title</p></blockquote>\n","html_type":"String"},{"tagname":"params","type":"Number","name":"itemId","doc":"<blockquote><p>Item ID to update</p></blockquote>\n","html_type":"Number"},{"tagname":"params","type":"Number","name":"num","doc":"<blockquote><p>The autoNumber needs to update</p></blockquote>\n","html_type":"Number"},{"tagname":"params","type":"Function","name":"callback","doc":"<blockquote><p>The callback function to handle other works in form</p></blockquote>\n\n<h1>See the example:</h1>\n\n<pre><code>updateAutoNumber('list', 1, 66, function(){\n    doSomething;\n});\n</code></pre>\n","html_type":"Function"}],"uses":["updateListItem"],"since":"FormActions 1.1 beta","members":[],"alternateClassNames":[],"aliases":{},"id":"class-updateAutoNumber","short_doc":"Update the autoNumber + 1 back to SharePoint list item. ...","classIcon":"icon-class","superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"html":"<div><pre class=\"hierarchy\"><h4>Uses</h4><div class='dependency'><a href='#!/api/updateListItem' rel='updateListItem' class='docClass'>updateListItem</a></div><h4>Files</h4><div class='dependency'><a href='source/FormActions.html#updateAutoNumber' target='_blank'>FormActions.js</a></div></pre><div class='doc-contents'><h1>Update the autoNumber + 1 back to SharePoint list item.</h1>\n\n<p><em>The autoNumber list must has the column name <strong>\"Auto Number\"</strong>, otherwise the function will not work.</em></p>\n        <p>Available since: <b>FormActions 1.1 beta</b></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>listTitle</span> : String<div class='sub-desc'><blockquote><p>Target SharePoint list title</p></blockquote>\n</div></li><li><span class='pre'>itemId</span> : Number<div class='sub-desc'><blockquote><p>Item ID to update</p></blockquote>\n</div></li><li><span class='pre'>num</span> : Number<div class='sub-desc'><blockquote><p>The autoNumber needs to update</p></blockquote>\n</div></li><li><span class='pre'>callback</span> : Function<div class='sub-desc'><blockquote><p>The callback function to handle other works in form</p></blockquote>\n\n<h1>See the example:</h1>\n\n<pre><code>updateAutoNumber('list', 1, 66, function(){\n    doSomething;\n});\n</code></pre>\n</div></li></ul></div><div class='members'></div></div>","meta":{}});