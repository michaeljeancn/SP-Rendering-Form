//Several SharePoint functions cannot initial in strict mode
//Setup for global vars
var itemListIDs = [];
var approverListIDs = [];
var currencyList = [];
var accountList = [];
var RIDText,
    autoNumber,
    WaitingDialog;

function init() {
    ledvance.UI.renderLayout();
    WaitingDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose("Wait for a moment please...", "It shouldn't be very long.", 200, 500);

    //Focus on form
    $('#ctl00_fullscreenmodeBtn').click();

    //Standardize page tables width
    var mainWidth = $('#MainInfo').width();
    $('.ItemsList table').width(mainWidth);
    $('.ItemsList iframe').width(mainWidth);
    $('.dialog table').width(500);

    //If there's SPD workflow task exists, show the task div in iframe
    /*var taskId = GetUrlKeyValue('TaskId');
    if(taskId != '') {
     $('#TaskAction iframe').attr('src','/content/10000510/PCVWR/_layouts/15/WrkTaskIP.aspx?List=d754c645%2D3e7e%2D400a%2D8ec2%2D79fdb00a9553&ID=' + taskId);
     $('#TaskAction').show();
     $("input[value='Save']").hide();
    }*/

    //fieldName and field change base on ClaimType select
    $("select[title^='Claim Type']").change(function(){
        var typeText = $("select[title^='Claim Type']").val();
        if(typeText === 'Project') {
            $("span[data-displayname='Cost Center']").hide();
            $("span[data-displayname='Order Number']").show();
            $(".changeLabel b").text('Order Number:');
        } else {
            $("span[data-displayname='Cost Center']").show();
            $("span[data-displayname='Order Number']").hide();
            $(".changeLabel b").text('Cost Center:');
        }
    });

    //Retrieve key information by BG selector
    $("select[title^='BG']").change(function(){
        if($(this).val() !== '') {
            $("input[title^='BG']").val($(this).val());
            for(var i in currencyList) {
                if(currencyList[i][0] === $(this).val()) {
                    var bgIndex = i;
                }
            }
            $("input[title^='Company Code']").val(currencyList[bgIndex][1]);
            $("input[title^='Currency']").val(currencyList[bgIndex][3]);
            $("input[title^='Prefix']").val(currencyList[bgIndex][4]);
            $("#AmountList7").val(currencyList[bgIndex][3]);

            var requestTitle = $(this).val() + '-' + RIDText;
            $("input[id^='Title']").val(requestTitle);
            //Retrieve expense type (FA Account) from PCV Account list base on BG selection
            getListItemsByKey('PCV Account', 'BG', $(this).val(), ['Title', 'English_x0020_Description', 'Chinese_x0020_Description', 'Claim_x0020_Type'], function(x){
                accountList = x;
            });
        }
    });

    //Show Attachments list only when there is Attachment(s) inside
    if($('#idAttachmentsTable').children().length === 0) {
        $('#attachOKbutton').click(function(){
            $('#Attachments').show();
            var oldLink = $("a[href^='javascript:RemoveLocal']:last").attr('href').replace('javascript:', '');
            var newLink = oldLink + ";if($('#idAttachmentsTable tbody').children().length===0)$('#Attachments').hide();return false";
            $("a[href^='javascript:RemoveLocal']:last").attr('onclick', newLink);
            $("a[href^='javascript:RemoveLocal']:last").attr('href', '#');
        });
    } else {
        $('#Attachments').show();
    }

    //Initial people picker in dialog
    if($('#ApproverPicker').length > 0) {
        initializePeoplePicker('ApproverPicker', function(){
            $('#ApproverPicker_TopSpan').attr('title', 'Approver Picker');
            $('#ApproverPicker_TopSpan_EditorInput').attr('title', 'Approver Picker Editor');
            attachUserFieldFunction('Approver Picker', ['Approver Account', 'Approver Name'], ['AccountName', 'PreferredName']);
        });
        $('#ApproverListDialog').css('paddingBottom', '150px');
    }

    //Prepend exit focus function into Close / Cancel button
    var oldFn = $("input[id$='ctl00_diidIOGoBack']").attr('onclick');
    var newFn = "$('#ctl00_exitfullscreenmodeBtn').click();" + oldFn;
    $("input[id$='ctl00_diidIOGoBack']").attr('onclick', newFn);

    //Setup btnAdd to enable list line adding dialog
    $('.btnAdd').click(function(){
        var divId = $(this).parent().parent().attr('id');
        var dialogId = divId + 'Dialog';
        $('#' + dialogId).dialog('open');
        //Reset all content
        if(divId === 'ApproverList'){
            $('#' + divId + '2').val('Approver' + $('#' + divId + ' tbody').children().length);
            $("a[id^='ApproverPicker']").click();
            $('#ApproverPicker').attr('style', '');
            $('#ApproverPicker').parent().find('.ms-formvalidation').remove();
        } else {
            $('#' + dialogId + ' .text').val('');
        }

        //Mark status as add
        $('#'+dialogId+' .Status').val('add');

        //Retrive expense type base on Claim Type
        if(divId === 'AmountList') {
            $.each(accountList, function(x, arr) {
                $.each(arr, function(y, val) {
                    if($.isArray(val)) {
                        if($.inArray($("select[title^='Claim Type']").val(), val) != -1) {
                            console.log(arr);
                            if(arr[2] === null) {
                                arr[2] = '';
                            }
                            $('#AmountList3').append("<option value='" + arr[1] + "' Account='" + arr[0] + "'>" + arr[0] + " - " + arr[1] + " - " + arr[2] +"</option>");
                        }
                    }
                });
            });
        }
        return false;
    });

    //Setup btnEdit to enable list line editing dialog
    $('.btnEdit').click(function(){
        var divId = $(this).parent().parent().attr('id');
        var dialogId = divId + 'Dialog';
        $('#'+dialogId).dialog('open');

        //Retrive expense type base on Claim Type
        if(divId === 'AmountList') {
            $.each(accountList, function(x, arr) {
                $.each(arr, function(y, val) {
                    if($.isArray(val)) {
                        if($.inArray($("select[title^='Claim Type']").val(), val) != -1) {
                            console.log(arr);
                            if(arr[2] === null) {
                                arr[2] = '';
                            }
                            $('#AmountList3').append("<option value='" + arr[1] + "' Account='" + arr[0] + "'>" + arr[0] + " - " + arr[1] + " - " + arr[2] +"</option>");
                        }
                    }
                });
            });
        }

        //Read content into dialog
        var listContent = [];
        $('tr.ui-selected').find('td').each(function(){
            listContent.push($(this).html());
        });
        for (var i in listContent) {
            var x = parseInt(i) + 1;
            $('#'+divId+x).val(listContent[i]);
        }
        //Setup textarea value/text to enable new line
        var oldStr = $('#' + dialogId + ' textarea').val();
        var newStr = oldStr.replace(/\<\S+\s+\S+\>/g, '\n');
        $('#' + dialogId + ' textarea').val(newStr);

        //Mark status as edit
        $('#'+dialogId+' .Status').val('edit');
        return false;
    });

    //Setup btnDelete to delete selected row in items list
    $('.btnDelete').click(function(){
        var divId = $(this).parent().parent().attr('id');

        //Save list ID for deleted items
        if($('tr.ui-selected td:eq(1)').text() === RIDText) {
            listIDs.push($('tr.ui-selected td:first').text());
        }

        $('tr.ui-selected').remove();

        if($('#' + divId + ' table tbody').children().length === 1){
            //$('#MPrice').text('0.00');
            $('#TPrice').text('0.00');
            $('#' + divId + ' .btnEdit').hide();
            $('#' + divId + ' .btnDelete').hide();
            $("select[title^='BG']").removeAttr('disabled');
            $("select[title^='Claim Type']").removeAttr('disabled');
        } else {
            //Calculate for Max and Totel amount when delete item
            var result = MaxnTotalCalc(divId, 'Amount');
            //$('#MPrice').text(result[0]);
            //$("input[id^='Max_']").val(result[0]);
            $('#TPrice').text(result[1]);
            $("input[id^='Total_']").val(result[1]);
        }

        //Remove Edit and Delete buttons
        $('#' + divId + ' .btnEdit').hide();
        $('#' + divId + ' .btnDelete').hide();

        return false;
    });

    //Select exists row in items list
    $('.selectable').selectable({
        stop: function() {
            var divId = $('tr.ui-selected').parent().parent().parent().attr('id');
            $('#' + divId + ' table tbody tr:first').attr('class','');
            $('#' + divId + ' table tbody tr:first td').attr('class','');
            if($('#' + divId + ' tr.ui-selected').length === 1) {
                $('#' + divId + ' .btnEdit').show();
                $('#' + divId + ' .btnDelete').show();
            } else {
                $('#' + divId + ' .btnEdit').hide();
                $('#' + divId + ' .btnDelete').hide();
            }
        }
    });

    //Basic calculation for Amount
    $('#AmountList6').change(function(){
        if ($(this).val() !== '') {
            var amount = parseFloat($(this).val());
            $(this).val(amount.toFixed(2));
        }
    });

    //Account fill in
    $('#AmountList3').change(function(){
        var selectedValue = $(this).val();
        $(this).children().each(function(){
            if($(this).val() === selectedValue) {
                $('#AmountList2').val($(this).attr('Account'));
            }
        });
    });

    //Dialog fields validation -- Required
    $('.Required').blur(function(){
        var dialogId = $(this).attr('id').replace(/\d/, 'Dialog');
        if($(this).val() === '') {
            console.log("It's Blank: " + $(this).attr('id'));
            if($(this).parent().find('.ms-formvalidation').length === 0) {
                $(this).css('border-color', 'red');
                $(this).parent().append("<span class='ms-formvalidation'><br />The field is required.</span>");
                $('#' + dialogId).next().find('.ui-button:first').attr('disabled','disabled');
            }
        } else {
            console.log("It's not Blank (" + $(this).attr('id') + '): ' + $(this).val());
            if($(this).parent().find('.ms-formvalidation').length !== 0) {
                $(this).attr('style', '');
                $(this).parent().find('.ms-formvalidation').remove();
            }
        }
        if($('#' + dialogId).find('.ms-formvalidation').length === 0 && $('#' + dialogId).next().find('.ui-button:first').attr('disabled') !== undefined ) {
            $('#' + dialogId).next().find('.ui-button:first').removeAttr('disabled');

        }
    });

    //Dialog to Add or Edit list item
    $('.dialog').dialog({
        autoOpen: false,
        width: 515,
        scrollbars: false,
        modal: true,
        buttons: [{
            text: "OK",
            click: function() {
                var dialogId = $(this).attr('id');
                var divId = dialogId.slice(0,dialogId.indexOf('Dialog'));
                var dialogLength = $('#' + dialogId + ' tbody').children().length;


                //Confirm status to decide to Add or Edit
                if($('#' + dialogId +' .Status').val() === 'add') {
                    //Add new list item
                    $('#'+divId+' table tbody').append('<tr class="ui-widget-content new"></tr>');
                    for (var i = 0; i < dialogLength; i++) {
                        var ii = i + 1;
                        if($('#' + divId + ii).is('textarea')) {
                            var textareaVal = $('#' + divId + ii).val();
                            var textareaSave = textareaVal.replace(/\n|\r\n/g, '<br />');
                            console.log(textareaSave);
                            $('#'+divId+' tr.ui-widget-content:last').append('<td>' + textareaSave + '</td>');
                        } else if($('#' + divId + ' .selectable th:eq(' + i + ')').attr('class').indexOf('hidden') != -1) {
                            $('#'+divId+' tr.ui-widget-content:last').append('<td class="hidden">'+$('#'+divId+ii).val()+'</td>');
                        } else {
                            $('#'+divId+' tr.ui-widget-content:last').append('<td>'+$('#'+divId+ii).val()+'</td>');
                        }
                    }

                    //Disable the selectors
                    $("select[title^='BG']").attr('disabled', 'disabled');
                    $("select[title^='Claim Type']").attr('disabled', 'disabled');

                } else {
                    //Edit selected list item
                    $('tr.ui-selected').html('');
                    for (var i = 0; i < dialogLength; i++) {
                        var ii = i + 1;
                        if($('#' + divId + ii).is('textarea')) {
                            var textareaVal = $('#' + divId + ii).val();
                            var textareaSave = textareaVal.replace(/\n|\r\n/g, '<br />');
                            $('#'+divId+' tr.ui-widget-content:last').append('<td>' + textareaSave + '</td>');
                        } else if($('#' + divId + ' .selectable th:eq(' + i + ')').attr('class').indexOf('hidden') != -1) {
                            $('#'+divId+' tr.ui-widget-content:last').append('<td class="hidden">'+$('#'+divId+ii).val()+'</td>');
                        } else {
                            $('#'+divId+' tr.ui-widget-content:last').append('<td>'+$('#'+divId+ii).val()+'</td>');
                        }
                    }
                    if($("input[id^='Status_']").val() !='Draft') {
                        $('tr.ui-selected').attr('class', 'ui-widget-content updated');
                    }
                }

                //Keep the border for table only, not td(s) inside
                $('tr.ui-widget-content').css('border','0');

                //Calculate for Totel amount when save item
                if(divId === 'AmountList') {
                    var result = MaxnTotalCalc(divId, 'Amount');
                    $('#TPrice').text(result[1]);
                }
                $(this).dialog('close');

            }}, {
            text: "Cancel",
            click: function() {
                $( this ).dialog('close');
            }
        }],
        close: function() {
            if($(this).next().find('.ui-button:first').attr('disabled') !== undefined ) {
                $(this).next().find('.ui-button:first').removeAttr('disabled');
                $(this).find('.ms-formvalidation').remove();
                $(this).find('input').removeAttr('style');
            }

            var dialogId = $(this).attr('id');
            var divId = dialogId.slice(0,dialogId.indexOf('Dialog'));
            if(divId === 'AmountList'){
                $("#AmountList3").html("<option selected='selected' value=''></option>");
            }
            $('#' + divId + ' .btnEdit').hide();
            $('#' + divId + ' .btnDelete').hide();
        }
    });

    //Initial the default form by different conditions - New, Edit, Disp
    if($("span[data-displayname='Request ID']").children().length !== 0 && $("input[title^='Request ID']").val() === '') {

        $("input[title^='Request ID']").attr('readonly', 'readonly');
        $("input[id^='Status_']").val('Draft');

        $("input[id^='Title']").css('display', 'none');
        $("input[title^='Request Date']").attr('readonly', 'readonly');
        $("input[title^='Request Date']").val(moment().format('YYYY-MM-DD'));
        $("table[title^='Request Date'] tbody tr td:eq(1)").css('display', 'none');

        //Resize the input controls
        $("input[id$='DateTimeFieldDate']").attr('class', 'ms-long');
        $("select[id$='DropDownChoice']").attr('class', 'ms-long');
        $("select[id$='LookupField']").attr('class', 'ms-long');
        //Create autoNumber RID, first get autoNumber from SP list item
        getListItemsByKey('Finance Approvers', 'ID', 1, ['Auto_x0020_Number'], function(x) {
            autoNumber = x[0][0];
            console.log(autoNumber);
            //Second create RID base on autoNumber
            createRID('PCV-', 'autoNumber', function(x) {
                RIDText = x;
                console.log(RIDText);
                $("input[title^='Request ID']").val(RIDText);
                //Structure of items list
                $('.RID').val(RIDText);

                //Last update SP list item with autoNumber + 1
                updateAutoNumber('Finance Approvers', 1, autoNumber, function(){
                    //Prepare for BG selection
                    getListItemsByKey('Currency List', 'ID', '', ['Title', 'Company_x0020_Code', 'Full_x0020_Name', 'Currency', 'Vendor_x0020_Prefix'], function(x){
                        currencyList = x;
                        for (var i in currencyList) {
                            $("select[title^='BG']").append("<option value='" + currencyList[i][0] + "'>" + currencyList[i][0] + ' - ' + currencyList[i][2] + "</option>");
                        }
                        //Attach the automatically get specific user information function to 'Pay To' people picker
                        attachUserFieldFunction('Pay To', ['Cost Center', 'Employee Number'], ['costCenter', 'employeeNumber']);
                        WaitingDialog.close();
                    });
                });
            });
        });

        //Show ItemsList - except Attachments list
        $('.ItemsList:not(#Attachments)').show();


    } /*else if($("span[data-displayname='Request ID']").children().length != 0 && $("input[title^='Request ID']").val() != '') {

  //Setup readonly fields
  $("input[id^='Form']").css('width','550');
  $("input[id^='Form']").attr('readonly', 'readonly');
  $("input[title^='Request ID']").attr('readonly', 'readonly');
  $("input[id^='Status_']").attr('readonly', 'readonly');
  $("input[title^='Request Date']").attr('readonly', 'readonly');
  $("table[title^='Request Date'] tbody tr td:eq(1)").css('display', 'none');

  //Resize the input controls
  $("input[id$='DateTimeFieldDate']").attr('class', 'ms-long');
  $("select[id$='DropDownChoice']").attr('class', 'ms-long');
  $("select[id$='LookupField']").attr('class', 'ms-long');

  //Retrieve list content base on RID
  RIDText = $("input[title^='Request ID']").val();
  getListItemsByKey('Scrapping Items', 'Title', RIDText);

 } else {

  //Hide and show div by Scrap Type, meanwhile retrieve list content with JSOM function
  var RIDString = $("span[data-displayname='Request ID']").text();
  var trimText = /\S+/;
  RIDText = trimText.exec(RIDString)[0];
  var myId = GetUrlKeyValue('ID');

  $('#Applist1').text($("span[data-displayname='CC Responsible'] .ms-peopleux-userdisplink").text());
  getListItemsByKey('Workflow History', 'Item', myId);

 }*/

}

function updateAutoNumber(listTitle, itemId, num, callback) {
    num = num + 1;
    var colName = ['ID', 'Auto_x0020_Number'];
    var itemContent = [itemId, num];
    this.callback = callback;

    //Update list item by specified information
    updateListItem(listTitle, colName, itemContent, callback);
}

function createRID(appPrefix, type, callback) {
    var now = moment();
    var RID = '';
    //Setup for type "time"
    if(type === 'time') {
        RID = appPrefix + now.format('YYMMDDHHmmss');
        //Setup for type "autoNumber"
    } else if(type === 'autoNumber') {
        RID = appPrefix + now.format('YYWW') + autoNumber;
    }

    if(callback && typeof(callback) === "function") {
        callback(RID);
    } else {
        return RID;
    }
}

function setUserFieldValue(fieldName, userName) {
    var _PeoplePickerTopId = $("div[title^='" + fieldName + "']").attr('id');
    var _PeoplePickerEditor = $("input[title^='" + fieldName + "']");
    _PeoplePickerEditor.val(userName);
    var _PeoplePickerObject = SPClientPeoplePicker.SPClientPeoplePickerDict[_PeoplePickerTopId];
    _PeoplePickerObject.AddUnresolvedUserFromEditor(true);
    return false;
}

function getUserFieldValue(fieldName, returnProperty, callback) {
    var _PeoplePickerTopId = $("div[title^='" + fieldName + "']").attr('id');
    var _PeoplePickerEditor = $("input[title^='" + fieldName + "']");
    var _PeoplePickerObject = SPClientPeoplePicker.SPClientPeoplePickerDict[_PeoplePickerTopId];
    var users = _PeoplePickerObject.GetAllUserInfo();
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        for (var userProperty in user) {
            if(userProperty==returnProperty){
                return user[userProperty];
            }
        }
    }
    if(callback && typeof(callback) === "function") {
        callback();
    }
}

function attachUserFieldFunction(fieldName, inputFields, keyValues) {
    this.fieldName = fieldName;
    this.inputFields = inputFields || [];
    this.keyValues = keyValues || [];

    var _PeoplePickerTopId = $("div[title^='" + fieldName + "']").attr('id');
    var _PeoplePickerObject = SPClientPeoplePicker.SPClientPeoplePickerDict[_PeoplePickerTopId];

    //Attach the function when specified people picker resolved person
    _PeoplePickerObject.OnUserResolvedClientScript = function(){

        var attachAccount;
        if(this.TopLevelElementId.slice(-7) === 'TopSpan') {
            var originDiv = $('#' + this.TopLevelElementId.replace('_TopSpan', ''));
        }
        var users = this.GetAllUserInfo();
        if(users.length !== 0) {
            for(var i = 0; i < users.length; i++) {
                var user = users[i];
                for(var userProperty in user) {
                    if(userProperty === 'Description') {
                        attachAccount = user[userProperty];
                        var attachUser = new Osram.UserInfo();
                        //Setup attachUser to get properties
                        attachUser.set_account(attachAccount);
                        attachUser.set_async(false);
                        attachUser.getUserProfilePropertiesFor();
                        console.log(attachUser);
                    }
                }
            }

            //Confirm inputFields and keyValues length are same, if so, loop inputFields and show the keyValues
            if(inputFields.length !== 0 && keyValues.length !== 0 && keyValues.length === inputFields.length) {
                for(var i in inputFields) {
                    $("input[title^='" + inputFields[i] + "']").val(attachUser._userProfileProperties[keyValues[i]]);
                }
                if(this.TopLevelElementId.slice(-7) === 'TopSpan' && originDiv.attr('style') !== '') {
                    originDiv.attr('style', '');
                    originDiv.parent().find('.ms-formvalidation').remove();
                    originDiv.next().blur();
                }
            } else {
                console.log('Error!');
            }
        } else if(users.length === 0 && this.TopLevelElementId.slice(-7) === 'TopSpan') {
            originDiv.css('border-color', 'red');
            originDiv.parent().append("<span class='ms-formvalidation'><br />The field is required.</span>");
        }
    };
}

function createListItem(listTitle, colName, itemContent, callback) {

    this.callback = callback;
    //Locate list by listTitle
    var clientContext = new SP.ClientContext();
    var list = clientContext.get_web().get_lists().getByTitle(listTitle);

    //Create list item
    var newItem = list.addItem();
    for (var i in colName) {
        newItem.set_item(colName[i],itemContent[i]);
    }
    newItem.update();

    clientContext.load(newItem);
    clientContext.executeQueryAsync(
        function() {
            console.log('Item created. callback: ' + callback);
            if(callback && typeof(callback) === "function") {
                callback();
            }
        },
        function (sender,args) {
            alert('Item creation failed: ' + args.get_message() + '\n' + args.get_stackTrace());
        }
    );
}

function updateListItem(listTitle, colName, itemContent, callback) {

    console.log(colName);
    console.log(itemContent);
    this.callback = callback;
    //Locate list by listTitle
    var clientContext = new SP.ClientContext();
    var list = clientContext.get_web().get_lists().getByTitle(listTitle);

    //Update list item
    var updateItem = list.getItemById(itemContent[0]);
    for (i=1;i<colName.length;i++) {
        console.log(colName[i] + ', ' + itemContent[i]);
        updateItem.set_item(colName[i],itemContent[i]);
    }
    updateItem.update();

    clientContext.executeQueryAsync(
        function() {
            console.log('Item updated. callback: ' + callback);
            if(callback && typeof(callback) === "function") {
                callback();
            }
        },
        function (sender,args) {
            alert('Item updateing failed: ' + args.get_message() + '\n' + args.get_stackTrace());
        }
    );
}

function deleteListItem(listTitle, listIDs, callback) {

    this.callback = callback;
    //Locate list by listTitle
    var clientContext = new SP.ClientContext();
    var list = clientContext.get_web().get_lists().getByTitle(listTitle);

    //Delete list item
    for (var i in listIDs) {
        var deletingListItem = list.getItemById(listIDs[i]);
        deletingListItem.deleteObject();
    }

    clientContext.executeQueryAsync(
        function() {
            console.log('Item deleted. callback: ' + callback);
            if(callback && typeof(callback) === "function") {
                callback();
            }
        },
        function (sender,args) {
            alert('Item deletion failed: ' + args.get_message() + '\n' + args.get_stackTrace());
        }
    );
}

function getListItemsByKey(listTitle, keyColName, keyField, queryFields, callback) {

    this.listTitle = listTitle;
    this.keyColName = keyColName;
    this.keyField = keyField || '';
    this.queryFields = queryFields || ['Title'];
    this.callback = callback;

    //Locate list by listTitle
    var clientContext = new SP.ClientContext();
    var list = clientContext.get_web().get_lists().getByTitle(listTitle);

    var camlQuery = new SP.CamlQuery();
    if(keyField !== '') {
        camlQuery.set_viewXml(
            '<View><Query><Where><Eq><FieldRef Name=\'' + keyColName + '\'/><Value Type=\'Text\'>' + keyField + '</Value></Eq></Where></Query></View>'
        );
    } else {
        camlQuery.set_viewXml(
            '<View><Query><Where><IsNotNull><FieldRef Name=\'' + keyColName + '\'/></IsNotNull></Where></Query></View>'
        );
    }
    this.collListItem = list.getItems(camlQuery);

    clientContext.load(collListItem);
    clientContext.executeQueryAsync(onQuerySucceeded, onQueryFailed);
}

function PreSaveAction(){
    //in this function you can handle field validation and additional changes before the form will be saved. Return true, if form can be saved, false if doesn’t.
    var divId;
    var formStatus;
    if($("select[id^='Scrap_']").val() === 'Inventory') {
        divId = 'InvList';
    } else {
        divId = 'AssetList';
    }
    if($('#ApproverList').css('display') === 'none') {
        formStatus = 'No scrapping item.';
    } else if($("input[id^='BU']").val() === '[]' || $("input[id^='SAP']").val() === '[]') {
        formStatus = 'Approver list not complete.';
    } else if($('.trHide:first').css('display') != 'none' && $("input[id^='AC_CON']").val() === '[]') {
        formStatus = 'No AC & CON approver.';
    } else if($('.trHide:last').css('display') != 'none' && $("input[id^='AC']").val() === '[]') {
        formStatus = 'No AC approver.';
    } else {
        formStatus = 'pass';
    }
    console.log('Current form status: ' + formStatus);

    //Get list column name and push into an array
    var itemList = $('#' + divId + ' table tbody');
    var listCol = $('#' + divId + ' table tbody tr:first');
    var colName = [];
    listCol.find('th').each(function(){
        colName.push($(this).attr('title'));
    });

    //Get new list item content and push into another array
    var newItemContents = [];
    var newGetItem = '';
    var newGetItems = [];
    for (i=1;i<itemList.children().length;i++){
        newGetItem = $('#' + divId + ' table tbody tr:eq('+i+').new');
        newGetItem.find('td').each(function(){
            newGetItems.push($(this).text());
        });
        newItemContents.push(newGetItems);
    }
    console.log(newItemContents);

    //Get updated list item content and push into third array
    var updateItemContents = [];
    var updateGetItem = '';
    var updateGetItems = [];
    for (i=1;i<itemList.children().length;i++){
        updateGetItem = $('#' + divId + ' table tbody tr:eq('+i+').updated');
        updateGetItem.find('td').each(function(){
            updateGetItems.push($(this).text());
        });
        updateItemContents.push(updateGetItems);
    }
    console.log(updateItemContents);

    if(formStatus === 'pass') {
        //Confirm to save the request
        var saveConfirm = confirm('Please confirm to submit the request:');
        if(saveConfirm === true) {

            //Create list items
            console.log(newItemContents[0].length);
            if(newItemContents[0].length > 0) {
                for (var i in newItemContents) {
                    createListItem("Scrapping Items", colName, newItemContents[i]);
                }
            }

            //Update list items
            console.log(updateItemContents[0].length);
            if(updateItemContents[0].length > 0) {
                for (var i in updateItemContents) {
                    updateListItem("Scrapping Items", colName, updateItemContents[i]);
                }
            }

            //Delete list items
            console.log(listIDs.length);
            if(listIDs.length > 0) {
                deleteListItem("Scrapping Items", listIDs);
            }

            //Setup Status
            if($("input[id^='Status_']").val() === 'Draft') {
                $("input[id^='Status_']").val('Submitted');
            } else if($("input[id^='Status_']").val() === 'Rework') {
                $("input[id^='Status_']").val('Resubmitted');
            }

            //Clean up approvers list
            if($('.trHide:first').css('display') === 'none') {
                $("a[id^='AC_']").click();
                $("input[id^='AppStatus3']").val('');
            }
            if($('.trHide:last').css('display') === 'none') {
                $("a[id^='AC_']:last").click();
                $("input[id^='AppStatus4']").val('');
            }

            //Exit focus form mode
            $('#ctl00_exitfullscreenmodeBtn').click();

            return true;
        } else {
            return false;
        }
    } else {
        alert('The form cannot save because: ' + formStatus);
    }
}

function onQuerySucceeded(sender, args) {
    var listItemInfos = [];
    var listItemEnumerator = collListItem.getEnumerator();

    //console.log(queryFields);
    //Enumerate the query result list items
    while (listItemEnumerator.moveNext()) {
        var listItem = listItemEnumerator.get_current();
        var listItemInfo = [];
        for (var i in queryFields) {
            listItemInfo.push(listItem.get_item(queryFields[i]));
        }
        listItemInfos.push(listItemInfo);
    }
    //console.log(listItemInfos);

    if(callback && typeof(callback) === 'function') {
        callback(listItemInfos);
    } else {
        return listItemInfos;
    }
}

function onQueryFailed(sender, args){
    alert('Request failed.' + args.get_message() + '\n' + args.get_stackTrace());
}

function MaxnTotalCalc(itemList, calcField) {

    //Push item list calculation fields into array
    var calcIndex = $("#" + itemList + " th[title='" + calcField + "']").index();
    var calcRows = $('#' + itemList + ' tr:last').index();
    var numberList = [];
    for (i=1;i<=calcRows;i++) {
        numberList.push(parseFloat($('#' + itemList + ' tr:eq(' + i + ') td:eq(' + calcIndex + ')').text()));
    }

    //Calculate the Max and Sum result and return
    numberList.sort(function(a, b){
        return a - b;
    });
    var maxResult = numberList[numberList.length-1];
    var sumResult = numberList.reduce(function(x, y) {
        return x + y;
    });
    return [maxResult.toFixed(2), sumResult.toFixed(2)];
}

function loadFrame(obj) {
    var url = obj.contentWindow.location.href;
    var topUrl = top.location.href;
    var taskId = GetUrlKeyValue('TaskId');
    if(taskId !== '') {
        if(url.indexOf('WrkTaskIP') === -1) {
            if(topUrl.indexOf('DispForm') != -1) {
                $(window.parent.document).find("input[value='Close']").click();
            } else {
                $(window.parent.document).find("input[value='Save']").click();
            }
        }
    }
}

function initializePeoplePicker(peoplePickerId, callback) {

    //Create a schema to store picker properties, and set the properties.
    var schema = {};
    schema['PrincipalAccountType'] = 'User,DL,SecGroup,SPGroup';
    schema['SearchPrincipalSource'] = 15;
    schema['ResolvePrincipalSource'] = 15;
    schema['AllowMultipleValues'] = false;
    schema['MaximumEntitySuggestions'] = 30;
    schema['Width'] = '370px';

    //Render and initialize the picker. Pass the ID of the DOM element that contains the picker, an array of initial PickerEntity objects to set the picker value, and a schema that defines picker properties.
    this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerId, null, schema);

    if(callback && typeof(callback) === 'function') {
        callback();
    }
}