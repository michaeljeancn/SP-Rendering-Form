/**
 * Setup for global vars: Prepare for list items deleting
 * @type {Array}
 */
var itemListIDs = [];
/**
 * Setup for global vars: Save for approver list items
 * @type {Array}
 */
var approverListIDs = [];
/**
 * Setup for global vars: Temporary BG list to retrieve from SharePoint list
 * @type {Array}
 */
var currencyList = [];
/**
 * Setup for global vars: Temporary account list to retrieve from SharePoint list
 * @type {Array}
 */
var accountList = [];
/**
 * @property RIDText, autoNumber, WaitingDialog -
 * Setup for global vars: All the key variables in form
 * @type {String}
 */
var RIDText,
    autoNumber,
    WaitingDialog;

/**
 * @class init
 * #The major function to initial the rendering form.
 * ##Several key rules:
 *     - Default HTML forms include: NewForm, DispForm and EditForm
 *     - Use jQuery selectors and value retrieve and setting
 *     - To enable customized code, SP.SOD.executeFunc('sp.js','SP.ClientContext',init); must include in forms
 *     - Ideally one Init function already enough for all 3 default HTML forms, to reduce the execution effort
 * @author Zhang, Wei - Michael
 * Several SharePoint functions cannot initial in strict mode
 * @return {Object} Rendering form designed as the way developer like
 *
 * @requires SP.ClientContext
 * @requires Osram.UserInfo
 * @requires Osram.UserInfo.CurrentUser
 * @requires datatables
 * @requires moment
 * @requires numeral
 * @requires getListItemsByKey
 * @requires createListItem
 * @requires updateListItem
 * @requires deleteListItem
 * @requires createRID
 * @requires updateAutoNumber
 * @requires setUserFieldValue
 * @requires getUserFieldValue
 * @requires attachUserFieldFunction
 * @requires MaxnTotalCalc
 * @requires initializePeoplePicker
 *
 * @since FormActions 1.0 beta
 */
function init() {
    /**
     * @event renderLayout
     * ledvance.UI.js already included inside HTML forms, renderLayout to initial the form
     * @requires ledvance.UI
     */
    ledvance.UI.renderLayout();
    /**
     * SharePoint predefined the WaitScreen, define the customize variable to include it into form
     * @type {Object} SharePoint defined ModalDialog
     * @requires SP.UI.ModalDialog
     */
    WaitingDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose("Wait for a moment please...", "It shouldn't be very long.", 200, 500);

    /**
     * @event fullscreenmodeBtn_click
     * Execute SharePoint *"Full Screen Mode"*
     */
    $('#ctl00_fullscreenmodeBtn').click();

    /**
     * @event table_width
     * Standardize page tables width
     * @type {Number} pixle of width
     */
    var mainWidth = $('#MainInfo').width();
    $('.ItemsList table').width(mainWidth);
    $('.dialog table').width(500);

    /**
     * @event Claim_Type_change
     * FieldName and field change base on ClaimType select
     * Attach the function to *"Claim Type"* selector's change method
     * var typeText Current selector's value
     * Other related field will change based on the value change
     */
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

    /**
     * @event BG_change
     * Retrieve key information by BG selector
     * If *"BG"* selecter's value changed and not blank, insert the retrieved data in variable *"currencyList"* (array).
     * Meanwhile, get *"PCV Account"* list items base on BG, and save into variable *"accountList"* (array).
     */
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

            /**
             * @event getListItemsByKey_Account
             * For details please check: {@link getListItemsByKey}.
             * Retrieve expense type (FA Account) from PCV Account list base on BG selection.
             * Result is Accounts information of BG, return as Array and assign to global accountList within callback function.
             */
            getListItemsByKey('PCV Account', 'BG', $(this).val(), ['Title', 'English_x0020_Description', 'Chinese_x0020_Description', 'Claim_x0020_Type'], function(x){
                accountList = x;
            });
        }
    });

    /**
     * @event Attachments_show
     * Show Attachments list only when there is Attachment(s) inside.
     */
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

    /**
     * @event initializePeoplePicker_ApproverPicker
     * Initial people picker in dialog with function {@link initializePeoplePicker}
     *
     * @since FormActions 1.2 beta
     */
    if($('#ApproverPicker').length > 0) {
        initializePeoplePicker('ApproverPicker', function(){
            $('#ApproverPicker_TopSpan').attr('title', 'Approver Picker');
            $('#ApproverPicker_TopSpan_EditorInput').attr('title', 'Approver Picker Editor');
            /**
             * @event attachUserFieldFunction_ApproverPicker
             * Attach the automatically get user information function to *"Approver Picker"* people picker, see details {@link attachUserFieldFunction}
             */
            attachUserFieldFunction('Approver Picker', ['Approver Account', 'Approver Name'], ['AccountName', 'PreferredName']);
        });
        $('#ApproverListDialog').css('paddingBottom', '150px');
    }

    /**
     * @event diidIOGoBack_attr
     * Prepend exit focus function into Close / Cancel button
     */
    var oldFn = $("input[id$='ctl00_diidIOGoBack']").attr('onclick');
    var newFn = "$('#ctl00_exitfullscreenmodeBtn').click();" + oldFn;
    $("input[id$='ctl00_diidIOGoBack']").attr('onclick', newFn);

    /**
     * @event btnAdd_click
     * Setup btnAdd to enable list line adding dialog
     */
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
                            $('#TypeList tbody').append("<tr><td>" + arr[0] + "</td><td>" + arr[1] + "</td><td>" + arr[2] +"</td></tr>");
                        }
                    }
                });
            });
        }
        return false;
    });

    /**
     * @event btnEdit_click
     * Setup btnEdit to enable list line editing dialog
     */
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
                            $('#TypeList tbody').append("<tr><td>" + arr[0] + "</td><td>" + arr[1] + "</td><td>" + arr[2] +"</td></tr>");
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

    /**
     * @event btnDelete_click
     * Setup btnDelete to delete selected row in items list
     */
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

    /**
     * @event selectable
     * Enable select exists row(s) in items list
     */
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

    /**
     * @event AmountList6_change
     * Basic calculation for Amount
     */
    $('#AmountList6').change(function(){
        if ($(this).val() !== '') {
            var amount = parseFloat($(this).val());
            $(this).val(amount.toFixed(2));
        }
    });

    /**
     * @event AmountList3_click
     * Open the account type list dialog
     */
    $('#AmountList3').click(function() {
        $('#TypeList').dialog('open');
    });

    /**
     * @method datatable_dialog
     * Dialog to display datatable and select
     * @param  {Boolean} autoOpen Dialog open automatically or not
     * @param  {Number} width Dialog width
     * @param  {Boolean} scrollbars Dialog shows scroll bars or not
     * @param  {Boolean} modal Dialog shows as modal window or not
     * @param  {Function/Object} open Dialog open method setup
     * @param  {Function/Object} close Dialog close method setup
     */
    $('.datatable').dialog({
        autoOpen: false,
        width: 600,
        scrollbars: false,
        modal: true,
        open: function () {
            /**
             * @method accountData
             * Define the datatable
             * @type {Object}
             *
             * @since FormActions 1.3 beta
             */
            var accountData = $('.datatable table').DataTable({
                select: 'single'
            });
            /**
             * @event accountData_select
             * Listen the datatable **"select"** event and put the values into inputs
             * @param  {Object} e        Mandotary parameter, element
             * @param  {Object} dt       Mandotary parameter, datatable
             * @param  {String} type     Mandotary parameter, selected type
             * @param  {Number} indexes  Mandotary parameter, selected index
             * @return {Array}  dataRow  The real selected data
             *
             * @since FormActions 1.3 beta
             */
            accountData.on('select', function (e, dt, type, indexes) {
                if(type === 'row') {
                    var dataRow = accountData.rows(indexes).data()[0];
                    $('#AmountList2').val(dataRow[0]);
                    $('#AmountList3').val(dataRow[1]);
                    accountData.destroy();
                    $('#TypeList').dialog('close');
                }
            });
        },
        close: function() {
            $('.datatable tbody').find('tr').remove();
        }
    });

    /**
     * @event Required_blur
     * Dialog fields validation -- Required
     */
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

    /**
     * @method dialog_dialog
     * Dialog to Add or Edit list item
     * @param  {Boolean} autoOpen Dialog open automatically or not
     * @param  {Number} width Dialog width
     * @param  {Boolean} scrollbars Dialog shows scroll bars or not
     * @param  {Boolean} modal Dialog shows as modal window or not
     * @param  {Object} buttons Dialog additional buttons setup
     * @param  {Function/Object} close Dialog close method setup
     */
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

    /**
     * @property form_Content
     * ####Initial the default form by different conditions - New, Edit, Disp
     *     - Confirm if "Request ID" or "RID" value exists
     *     - If not, confirm current opening is NewForm
     *     - If yes, check "RID" span has any child
     *     - If yes and span do has child, confirm current opening is EditForm
     *     - Otherwise, confirm current opening is DispForm (ReadOnly)
     */
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
        /**
         * @event getListItemsByKey_autoNumber
         * Create autoNumber RID, first get autoNumber from SP list item, see details: {@link getListItemsByKey}
         * @return {Array}    AutoNumber list item content, assign first one as autoNumber.
         */
        getListItemsByKey('Finance Approvers', 'ID', 1, ['Auto_x0020_Number'], function(x) {
            autoNumber = x[0][0];
            console.log(autoNumber);
            /**
             * @event createRID_PCV
             * Second create RID base on autoNumber, see details: {@link createRID}
             * @return {String}    Generated RID text, assign it as RIDText.
             */
            createRID('PCV-', 'autoNumber', function(x) {
                RIDText = x;
                console.log(RIDText);
                $("input[title^='Request ID']").val(RIDText);
                //Structure of items list
                $('.RID').val(RIDText);

                /**
                 * @event updateAutoNumber_PCV
                 * Last update SP list item with autoNumber + 1, see details: {@link updateAutoNumber}
                 * @since FormActions 1.1 beta
                 */
                updateAutoNumber('Finance Approvers', 1, autoNumber, function(){
                    /**
                     * @event getListItemsByKey_BG
                     * Prepare for BG selection, see details: {@link getListItemsByKey}
                     * @return {Array}      BG list item content, assign whole Array as currencyList.
                     */
                    getListItemsByKey('Currency List', 'ID', '', ['Title', 'Company_x0020_Code', 'Full_x0020_Name', 'Currency', 'Vendor_x0020_Prefix'], function(x){
                        currencyList = x;
                        for (var i in currencyList) {
                            $("select[title^='BG']").append("<option value='" + currencyList[i][0] + "'>" + currencyList[i][0] + ' - ' + currencyList[i][2] + "</option>");
                        }
                        /**
                         * @event attachUserFieldFunction_PayTo
                         * Attach the automatically get specific user information function to 'Pay To' people picker, see detials: {@link attachUserFieldFunction}
                         * @since FormActions 1.2 beta
                         */
                        attachUserFieldFunction('Pay To', ['Cost Center', 'Employee Number'], ['costCenter', 'employeeNumber']);
                        /**
                         * @event WaitingDialog_close
                         * Close the WaitingDialog after all events executed successfully.
                         */
                        WaitingDialog.close();
                    });
                });
            });
        });

        /**
         * @event ItemList_show
         * Show every ItemsList except Attachments
         */
        $('.ItemsList:not(#Attachments)').show();


    } //else if($("span[data-displayname='Request ID']").children().length != 0 && $("input[title^='Request ID']").val() != '') {

  //Setup readonly fields
 //  $("input[id^='Form']").css('width','550');
 //  $("input[id^='Form']").attr('readonly', 'readonly');
 //  $("input[title^='Request ID']").attr('readonly', 'readonly');
 //  $("input[id^='Status_']").attr('readonly', 'readonly');
 //  $("input[title^='Request Date']").attr('readonly', 'readonly');
 //  $("table[title^='Request Date'] tbody tr td:eq(1)").css('display', 'none');

 //  //Resize the input controls
 //  $("input[id$='DateTimeFieldDate']").attr('class', 'ms-long');
 //  $("select[id$='DropDownChoice']").attr('class', 'ms-long');
 //  $("select[id$='LookupField']").attr('class', 'ms-long');

 //  //Retrieve list content base on RID
 //  RIDText = $("input[title^='Request ID']").val();
 //  getListItemsByKey('Scrapping Items', 'Title', RIDText);

 // } else {

 //  //Hide and show div by Scrap Type, meanwhile retrieve list content with JSOM function
 //  var RIDString = $("span[data-displayname='Request ID']").text();
 //  var trimText = /\S+/;
 //  RIDText = trimText.exec(RIDString)[0];
 //  var myId = GetUrlKeyValue('ID');

 //  $('#Applist1').text($("span[data-displayname='CC Responsible'] .ms-peopleux-userdisplink").text());
 //  getListItemsByKey('Workflow History', 'Item', myId);

 // }

}

/**
 * @method PreSaveAction
 * ###In this function you can handle field validation and additional changes before the form will be saved. Return true, if form can be saved, false if doesn’t
 * ###Several suggestions:
 *     - Organize all the saving/deleting functions in here
 *     - Validation rules should more focus on additional contents
 *     - SharePoint original list item will validate itself by column type
 * @preventable
 */
function PreSaveAction(){
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

/**
 * @class updateAutoNumber
 * #Update the autoNumber + 1 back to SharePoint list item.
 *
 * *The autoNumber list must has the column name **"Auto Number"**, otherwise the function will not work.*
 *
 * @param {String} listTitle >Target SharePoint list title
 * @param {Number} itemId >Item ID to update
 * @param {Number} num >The autoNumber needs to update
 * @param {Function} callback >The callback function to handle other works in form
 *
 * @uses updateListItem
 * @since FormActions 1.1 beta
 *
 * #See the example:
 *     updateAutoNumber('list', 1, 66, function(){
 *         doSomething;
 *     });
 */
function updateAutoNumber(listTitle, itemId, num, callback) {

    num = num + 1;
    var colName = ['ID', 'Auto_x0020_Number'];
    var itemContent = [itemId, num];
    this.callback = callback;

    //Update list item by specified information
    updateListItem(listTitle, colName, itemContent, callback);
}

/**
 * @class createRID
 * #Create Request ID (RID) with 2 different types
 *
 * @param  {String}   appPrefix >Prefix to identify current application
 * @param  {String}   type      >Predefined 2 types: time and autoNumber
 * @param  {Function} callback  >Callback function after RID generation
 * @return {String}             >New Request ID (RID)
 *
 * @since FormActions 1.0 beta
 *
 * #See the example 1 for type "time":
 *     createRID('prefix', 'time', function(){
 *         doSomething;
 *     });
 *
 * #See the example 2 for type "autoNumber":
 *     createRID('prefix', 'autoNumber', function(){
 *         updateAutoNumber(...);
 *     });
 */
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

/**
 * @class setUserFieldValue
 * #Input user field by specifc user account
 * @param {String} fieldName >The user field title
 * @param {String} userName  >The user account needs to insert
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     setUserFieldValue('PeoplePicker', 'domain\\username');
 */
function setUserFieldValue(fieldName, userName) {
    var _PeoplePickerTopId = $("div[title^='" + fieldName + "']").attr('id');
    var _PeoplePickerEditor = $("input[title^='" + fieldName + "']");
    _PeoplePickerEditor.val(userName);
    var _PeoplePickerObject = SPClientPeoplePicker.SPClientPeoplePickerDict[_PeoplePickerTopId];
    _PeoplePickerObject.AddUnresolvedUserFromEditor(true);
    return false;
}

/**
 * @class getUserFieldValue
 * #Retrieve user field value matches returnProperty
 * @param  {String}   fieldName      >The user field title
 * @param  {String}   returnProperty >The property needs to retrieve
 * @param  {Function} callback       >The callback function
 * @return {String}                  >The content of returnProperty
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     getUserFieldValue('PeoplePicker', 'Description', function(){
 *         doSomething;
 *     });
 */
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

/**
 * @class attachUserFieldFunction
 * #Attach function to specific user field
 * @param  {String} fieldName   >The user field title
 * @param  {String[]} inputFields >The fields array to input properties
 * @param  {String[]} keyValues   >The values arrya to input into specific fields
 *
 * @since FormActions 1.2 beta
 *
 * #See the example:
 *     attachUserFieldFunction('PeoplePicker', ['field1', 'field2'], ['value1', 'value2']);
 */
function attachUserFieldFunction(fieldName, inputFields, keyValues) {
    this.fieldName = fieldName;
    this.inputFields = inputFields || [];
    this.keyValues = keyValues || [];

    /**
     * @property _PeoplePickerObject
     * ####The real people picker location
     */
    var _PeoplePickerTopId = $("div[title^='" + fieldName + "']").attr('id');
    var _PeoplePickerObject = SPClientPeoplePicker.SPClientPeoplePickerDict[_PeoplePickerTopId];

    /**
     * @property OnUserResolvedClientScript
     * ####Attach the function when specified people picker resolved person
     *     - This is the place to attach client script, e.g.: JavaScript, VBScript...
     *     - After the user resolved, this script will execute automatically
     */
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

/**
 * @class createListItem
 * #Create item for specific SP list with given data
 * @param  {String}   listTitle   >The SharePoint list name
 * @param  {String[]}   colName     >The columns to insert data in
 * @param  {String/Number/Boolean[]}   itemContent >The content to insert to item columns
 * @param  {Function} callback    >The callback function
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     createListItem('list', ['Title', 'Column'], ['item1', 'content'], function(){
 *         doSomething;
 *     });
 */
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

/**
 * @class updateListItem
 * #Update specific item in specific SP list with given data
 * @param  {String}   listTitle   >The SharePoint list name
 * @param  {String[]}   colName     >The columns to insert data in
 * @param  {String/Number/Boolean[]}   >itemContent The content to insert to item columns
 * @param  {Function} callback    >The callback function
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     updateListItem('list', ['Title', 'Column'], ['item1', 'content'], function(){
 *         doSomething;
 *     });
 */
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

/**
 * @class deleteListItem
 * #Delete specific items in specific SP list
 * @param  {String}   listTitle >The SharePoint list name
 * @param  {Number[]}   listIDs   >The item IDs to be delete
 * @param  {Function} callback  >The callback function
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     deleteListItem('list', [1, 2, 3], function(){
 *         doSomething;
 *     });
 */
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

/**
 * @class getListItemsByKey
 * #This is the very important function to retrieve data from a specific list with key value
 * @param  {String}   listTitle   >The SharePoint list needs to query
 * @param  {String}   keyColName  >The information query column
 * @param  {String/Number/Boolean}   keyField    >The information needs to query with
 * @param  {String[]}   queryFields >The information needs to query out
 * @param  {Function} callback    >The callback function once query succeeded
 * @return {Object} collListItem is the return data, requires onQuerySuccedded function handel first
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     getListItemsByKey('list', 'ID', 1, ['Title', 'Column'], function(){
 *         doSomething;
 *     });
 */
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

/**
 * @method onQuerySucceded
 * Execute if getListItemsByKey succeeded, callback function inheritance from {@link getListItemsByKey}
 * @return {String[]}        >Return all list items contents
 *
 * @since FormActions 1.0 beta
 */
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

/**
 * @method onQueryFailed
 * Execute if {@link getListItemsByKey} failed
 * @param  {Object} args   >The error message object
 *
 * @since FormActions 1.0 beta
 */
function onQueryFailed(sender, args){
    alert('Request failed.' + args.get_message() + '\n' + args.get_stackTrace());
}

/**
 * @class MaxnTotalCalc
 * Calculate the max number and result in a form list
 * @param {String} itemList  >The list contains calculate numbers
 * @param {String} calcField >The column contains calculate numbers
 * @return {Number[]} Return 2 number values in array, first one is Max number, second one is Total number.
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     MaxnTotalCalc('formList', 'numbers');
 */
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

/**
 * @class initializePeoplePicker
 * The Microsoft JSOM function to initial a self designed people picker
 * @param  {String}   peoplePickerId >The HTML id of text input
 * @param  {Function} callback       >The callback function
 *
 * @since FormActions 1.2 beta
 *
 * #See the example:
 *     initializePeoplePicker('myInput', function(){
 *         doSomething;
 *     });
 */
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