# SP-Rendering-Form
## The personal works to design *SharePoint rendering form*, include *HTML, CSS and JS*.
GitHub is only the place for my development storage before final deploy to SharePoint ~~2013 on-premise~~ Online.
- Yes we've already start to migrate SharePoint from on-premise to cloud.

**! Once the standardize done, no further modification/update, whole project will close!**

#### 1. HTML files:
>Files will build my own blocks inside SharePoint for different purposes:
* NewForm.html
* ~~EditForm.html~~
- Temporarily we don't need it, since Microsoft Flow do not support customize *Approval* event yet.
* DisplayForm.html

#### 2. CSS files:
>Files to render the HTML files' styles, include jQuery UI and self organized css file
##### 3rd Party source:
>* jQuery-ui.min.css
##### Self organized file:
* ledvance.ui.css

#### 3. JavaScript files:
>Files to provide functions, behaviors and actions, include lots of 3rd party .js and self developed .js file
##### 3rd Party source:
>* jQuery.min.js - it's ~~already consolidated into SharePoint on-premise~~ uploaded to CDN on SharePoint Online, current version 2.2.4; newest version 3.3.1 will have "caller" issue while try to save with attachment in SharePoint Online.
>* jQuery-ui.min.js
>* moment.min.js
>* numeral.js
##### Self developed file - will not fully include into GitHub:
* ledvance.ui.js
* Osram.UserInfo.js
* Osram.UserInfo.CurrentUser.js
* FormActions.js

#### 4. JavaScript document:
>Document to describe detail usage of JavaScript functions, behaviors and actions.
##### Already created as HTML source via JSDuck, open it here: /docs/index.html