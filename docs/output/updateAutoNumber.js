Ext.data.JsonP.updateAutoNumber({"tagname":"class","name":"updateAutoNumber","autodetected":{},"files":[{"filename":"FormActions.js","href":"FormActions.html#updateAutoNumber"}],"params":[{"tagname":"params","type":"String","name":"listTitle","doc":"<p>Target SharePoint list title</p>\n","html_type":"String"},{"tagname":"params","type":"Number","name":"itemId","doc":"<p>Item ID to update</p>\n","html_type":"Number"},{"tagname":"params","type":"Number","name":"num","doc":"<p>The autoNumber needs to update</p>\n","html_type":"Number"},{"tagname":"params","type":"Function","name":"callback","doc":"<p>The callback function to handle other works in form</p>\n\n<h1>See the example:</h1>\n\n<pre><code>updateAutoNumber('list', 1, 66, function(){\n    otherWorks();\n});\n</code></pre>\n","html_type":"Function"}],"requires":["updateListItem"],"members":[],"alternateClassNames":[],"aliases":{},"id":"class-updateAutoNumber","short_doc":"Update the autoNumber + 1 back to SharePoint list item. ...","classIcon":"icon-class","superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Requires</h4><div class='dependency'><a href='#!/api/updateListItem' rel='updateListItem' class='docClass'>updateListItem</a></div><h4>Files</h4><div class='dependency'><a href='source/FormActions.html#updateAutoNumber' target='_blank'>FormActions.js</a></div></pre><div class='doc-contents'><h1>Update the autoNumber + 1 back to SharePoint list item.</h1>\n\n<p>The autoNumber list must has the column name <strong>\"Auto Number\"</strong>, otherwise the function will not work.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>listTitle</span> : String<div class='sub-desc'><p>Target SharePoint list title</p>\n</div></li><li><span class='pre'>itemId</span> : Number<div class='sub-desc'><p>Item ID to update</p>\n</div></li><li><span class='pre'>num</span> : Number<div class='sub-desc'><p>The autoNumber needs to update</p>\n</div></li><li><span class='pre'>callback</span> : Function<div class='sub-desc'><p>The callback function to handle other works in form</p>\n\n<h1>See the example:</h1>\n\n<pre><code>updateAutoNumber('list', 1, 66, function(){\n    otherWorks();\n});\n</code></pre>\n</div></li></ul></div><div class='members'></div></div>","meta":{}});