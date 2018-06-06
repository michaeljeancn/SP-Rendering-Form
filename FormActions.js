/**
<<<<<<< HEAD
 * Setup for global vars: Temporary BG list to retrieve from SharePoint list
 * @type {Array}
 */
var bgList = [];
/**
 * Setup for global vars: Temporary vendor list to retrieve from SharePoint list
=======
 * Setup for global vars: Prepare for list items deleting
>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
 * @type {Array}
 */
var vendorList = [];
/**
<<<<<<< HEAD
 * Setup for global vars: Amount Column name list to save to SharePoint list
=======
 * Setup for global vars: Save for approver list items
>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
 * @type {Array}
 */
var amountColName = [];
/**
 * Setup for global vars: Approver Column name list to save to SharePoint list
 * @type {Array}
 */
var approverColName = [];
/**
 * Setup for global vars: Amount item list to add to SharePoint list
 * @type {Array}
 */
var newAmountItemContents = [];
/**
 * Setup for global vars: Approver item list to add to SharePoint list
 * @type {Array}
 */
var newApproverItemContents = [];
/**
<<<<<<< HEAD
 * Setup for global vars: Amount item list to update to SharePoint list
=======
 * Setup for global vars: Temporary BG list to retrieve from SharePoint list
>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
 * @type {Array}
 */
var updateItemContents = [];
/**
<<<<<<< HEAD
 * Setup for global vars: Prepare for list items deleting
=======
 * Setup for global vars: Temporary account list to retrieve from SharePoint list
>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
 * @type {Array}
 */
var itemListIDs = [];
/**
 * Setup for global vars: Save for approver list items
 * @type {Array}
 */
var approverListIDs = [];
/**
 * @property RIDText, autoNumber, WaitingDialog -
 * Setup for global vars: All the key variables in form
 * @type {String}
 */
var RIDText,
    autoNumber,
    WaitingDialog;
/**
 * Setup for original function recorder/container of save button
 * @type {Function}
 */
var originalSaveButtonClickHandler = function(){};
/**
 * @class init
 * #The major function to initial the rendering form.
 * ##Several key rules:
 *     - Default HTML forms include: NewForm, DispForm and EditForm
 *     - Use jQuery selectors and value retrieve and setting
 *     - To enable customized code, SP.SOD.executeFunc('sp.js','SP.ClientContext',init); must include in forms
 *     - Ideally one Init function already enough for all 3 default HTML forms, to reduce the execution effort
<<<<<<< HEAD
 * @author Zhang, Wei - Michael <michael.zhang@ledvance.com>
=======
 * @author Zhang, Wei - Michael
>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
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
     * @type {Number} pixel of width
     */
    $('#MainInfo').width(1200);
    var mainWidth = $('#MainInfo').width();
    var numWidth = Number(mainWidth);
    $('.ItemsList table').width(mainWidth);
    $('#idAttachmentsTable').width(String(numWidth - 100) + 'px');
    $('#idAttachmentsTable').css('border', '0');
    $('.dialog table').width(500);

    /**
     * @event originalSaveButtonClickHandler_replace
     * Record and replace the original save button function
     * @type {Function}
     *
     * @since FormActions 1.3 beta
     */
    var saveButton = $("[name$='diidIOSaveItem']"); //gets form save button and ribbon save button
    if (saveButton.length > 0) {
      originalSaveButtonClickHandler = saveButton[0].onclick;  //save original function
    }
    $(saveButton).attr("onclick", "validateAndSaveForm()"); //change onclick to execute our custom validation and save function

    /**
     * @event coSelect_change
     * FieldName and field hide and show base on select
     */
    $("#coSelect").change(function(){
        if($(this).val === "Cost Center") {
            $("span[data-displayname='Order Number']").hide();
            $("span[data-displayname='Cost Center']").show();
        } else {
            $("span[data-displayname='Order Number']").show();
            $("span[data-displayname='Cost Center']").hide();
        }
    });

    /**
     * @event BG_change
     * Retrieve key information by BG selector
     * If *"BG"* selector's value changed and not blank, insert the retrieved data in variable *"bgList"* (array).
     */
    $("select[title^='BG']").change(function(){
        var bgIndex;
        if($(this).val() !== '') {
            $("input[title^='BG']").val($(this).val());
            for(var i in bgList) {
                if(bgList[i][0] === $(this).val()) {
                    bgIndex = i;
                }
            }
            $("input[title^='Company Code']").val(bgList[bgIndex][1]);

            var requestTitle = $(this).val() + '-' + RIDText;
            $("input[id^='Title']").val(requestTitle);
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
<<<<<<< HEAD
        $('#Attachments').hide();
=======
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
>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
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
     * @preventable
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
        } else if ($('#AmountList tbody').children().length === 1){
            $('#' + dialogId + ' .text').val('');
            $('#' + divId + '4').removeAttr('disabled');
        } else if ($('#AmountList tbody').children().length !== 1){
            $('#' + divId + '2').val('');
            $('#' + divId + '3').val('');
            $('#' + divId + '4').attr('disabled', 'disabled');
        }

        //Mark status as add
        $('#'+dialogId+' .Status').val('add');
<<<<<<< HEAD
=======

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
>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
        return false;
    });

    /**
     * @event btnEdit_click
     * Setup btnEdit to enable list line editing dialog
     * @preventable
     */
    $('.btnEdit').click(function(){
        var divId = $(this).parent().parent().attr('id');
        var dialogId = divId + 'Dialog';
        $('#'+dialogId).dialog('open');

<<<<<<< HEAD
=======
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

>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
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
     * @preventable
     */
    $('.btnDelete').click(function(){
        var divId = $(this).parent().parent().attr('id');

        //Save list ID for deleted items
        if($('tr.ui-selected td:eq(1)').text() === RIDText) {
            listIDs.push($('tr.ui-selected td:first').text());
        }

        $('tr.ui-selected').remove();

        if($('#' + divId + ' table tbody').children().length === 1){
            $('#TPrice').text('0.00');
            $('#' + divId + ' .btnEdit').hide();
            $('#' + divId + ' .btnDelete').hide();
            $("select[title^='BG']").removeAttr('disabled');
            $("select[title^='Claim Type']").removeAttr('disabled');
        } else {
            //Calculate for Total amount when delete item
            var result = MaxnTotalCalc(divId, 'Amount');
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
     * @event AmountList3_change
     * Basic calculation for Amount
     */
    $('#AmountList3').change(function(){
        if ($(this).val() !== '') {
            var amount = numeral($(this).val());
            $(this).val(amount.format('0,0.00'));
        }
    });

    /**
<<<<<<< HEAD
=======
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
>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
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
                var textareaVal, textareaSave;

                //Confirm status to decide to Add or Edit
                if($('#' + dialogId +' .Status').val() === 'add') {
                    //Add new list item
                    $('#'+divId+' table tbody').append('<tr class="ui-widget-content new"></tr>');
                    for (var i = 0; i < dialogLength; i++) {
                        var ii = i + 1;
                        if($('#' + divId + ii).is('textarea')) {
                            textareaVal = $('#' + divId + ii).val();
                            textareaSave = textareaVal.replace(/\n|\r\n/g, '<br />');
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
                            textareaVal = $('#' + divId + ii).val();
                            textareaSave = textareaVal.replace(/\n|\r\n/g, '<br />');
                            $('#'+divId+' tr.ui-selected').append('<td>' + textareaSave + '</td>');
                        } else if($('#' + divId + ' .selectable th:eq(' + i + ')').attr('class').indexOf('hidden') != -1) {
                            $('#'+divId+' tr.ui-selected').append('<td class="hidden">'+$('#'+divId+ii).val()+'</td>');
                        } else {
                            $('#'+divId+' tr.ui-selected').append('<td>'+$('#'+divId+ii).val()+'</td>');
                        }
                    }
                    if($("input[id^='Status_']").val() !='Draft') {
                        $('tr.ui-selected').attr('class', 'ui-widget-content updated');
                    }
                }

                //Keep the border for table only, not td(s) inside
                $('tr.ui-widget-content').css('border','0');

                //Calculate for Total amount when save item
                if(divId === 'AmountList') {
                    var result = MaxnTotalCalc(divId, 'Amount');
                    $('#TPrice').text(result[1]);
                    $("input[title^='Total Amount']").val(result[1]);
                    $("input[title^='Currency']").val($('#AmountList4').val());
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
     *     - If yes and span does have child, confirm current opening is EditForm
     *     - Otherwise, confirm current opening is DispForm (ReadOnly)
     */
    if($("span[data-displayname='Request ID']").children().length !== 0 && $("input[title^='Request ID']").val() === '') {

        $("input[title^='Request ID']").attr('readonly', 'readonly');
        $("input[id^='Status_']").val('Draft');

        $("input[title^='Request Date']").attr('readonly', 'readonly');
        $("input[title^='Request Date']").val(moment().format('YYYY-MM-DD'));
        $("table[title^='Request Date'] tbody tr td:eq(1)").css('display', 'none');

        //Resize the input controls
        $("input[id$='DateTimeFieldDate']").attr('class', 'ms-long');
        $("select[id$='DropDownChoice']").attr('class', 'ms-long');
        $("select[id$='LookupField']").attr('class', 'ms-long');

        if(GetUrlKeyValue('RID') === '') {
            getListItemsByKey('Key Info List', 'ID', 1, ['AutoNumber'])
            .then(
                function(data) {
                    autoNumber = data[0][0];
                    createRID('Payment-', 'autoNumber')
                    .then(
                        function(data) {
                            RIDText = data;
                            $("input[title^='Request ID']").val(RIDText);
                            //Structure of items list
                            $('.RID').val(RIDText);
                            updateListItem('Key Info List', [{'ID': 1, 'AutoNumber': autoNumber + 1}])
                            .then(
                                getListItemsByKey('Key Info List', 'ID', '', ['Title', 'Company_x0020_Code','Full_x0020_Name'])
                                .then(
                                    function(data) {
                                        bgList = data;
                                        for (var i in bgList) {
                                            $('#BG_Replace_Field_DropDownChoice').append('<option value="' + bgList[i][0] + '">' + bgList[i][0] + ' - ' + bgList[i][2] + '</option>');
                                        }
                                        /**
                                         * @event initializePeoplePicker_ApproverPicker
                                         * Initial people picker in dialog with function {@link initializePeoplePicker}
                                         *
                                         * @since FormActions 1.2 beta
                                         */
                                        if($('#ApproverPicker').length > 0) {
                                            initializePeoplePicker('ApproverPicker')
                                            .then(
                                                function(){
                                                    $('#ApproverPicker_TopSpan').attr('title', 'Approver Picker');
                                                    $('#ApproverPicker_TopSpan_EditorInput').attr('title', 'Approver Picker Editor');
                                                    /**
                                                     * @event attachUserFieldFunction_ApproverPicker
                                                     * Attach the automatically get user information function to *"Approver Picker"* people picker, see details {@link attachUserFieldFunction}
                                                     */
                                                    attachUserFieldFunction('Approver Picker', ['Approver Account', 'Approver Name'], ['AccountName', 'PreferredName']);
                                                }
                                            );
                                            $('#ApproverListDialog').css('paddingBottom', '150px');
                                        }
                                        /**
                                         * @event WaitingDialog_close
                                         * Close the WaitingDialog after all events executed successfully.
                                         */
                                        WaitingDialog.close();
                                        getListItemsByKey('Vendor Master Data', 'ID', '', ['Title', 'Vendor_x0020_Name'])
                                        .then(
                                            function(data) {
                                                vendorList = data;
                                                $("input[title^='Vendor Code']").change(function() {
                                                    var result = '';
                                                    for (var i in vendorList) {
                                                        if ($(this).val() === vendorList[i][0]) {
                                                            result = vendorList[i][1];
                                                        }
                                                    }
                                                    if (result !== '') {
                                                        $("input[title^='Vendor Name']").val(result);
                                                    } else {
                                                        $("input[title^='Vendor Name']").val('');
                                                    }
                                                });
                                            }
                                        );
                                    }
                                )
                            );
                        }
                    );
                },
                function(err) {
                    console.log('Error: ' + err);
                }
            );
            /**
             * @event ItemList_show
             * Show every ItemsList except Attachments
             */
<<<<<<< HEAD
            $('.ItemsList:not(#Attachments)').show();
        } else {
            RIDText = GetUrlKeyValue('RID');
            getListItemsByKey('Payment Applications', 'Request_x0020_ID', RIDText, ['Request_x0020_Date', 'BG', 'Company_x0020_Code', 'Applicant', 'Claim_x0020_Type', 'PO', 'Cost_x0020_Center', 'Order_x0020_Number', 'Vendor_x0020_Code', 'Vendor_x0020_Name', 'Invoice_x0020_Number', 'Total_x0020_Amount', 'Currency'])
            .then(
                function(data) {
                    var currentItem = [];
                    $.each(data[data.length - 1], function(index, value) {
                        var actValue;
                        if (value === null) {
                            actValue = '';
                        } else {
                            actValue = value;
                        }
                        currentItem.push(actValue);
=======
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
>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
                    });
                    $("input[id^='Status_']").val('Rework');
                    $("input[title^='Request ID']").val(RIDText);
                    $("input[title^='Request Date']").val(currentItem[0]);
                    $("input[title^='BG']").val(currentItem[1]);
                    $("input[title^='Company Code']").val(currentItem[2]);
                    $("select[title^='Claim Type']").val(currentItem[4]);
                    $("input[title^='PO']").val(currentItem[5]);
                    $("input[title^='Cost Center']").val(currentItem[6]);
                    $("input[title^='Order Number']").val(currentItem[7]);
                    $("input[title^='Vendor Code']").val(currentItem[8]);
                    $("input[title^='Vendor Name']").val(currentItem[9]);
                    $("input[title^='Invoice Number']").val(currentItem[10]);
                    $("input[title^='Total Amount']").val(currentItem[11]);
                    $("input[title^='Currency']").val(currentItem[12]);
                    var loadApplicant = currentItem[3].get_email();
                    setUserFieldValue('Applicant', loadApplicant);
                    getListItemsByKey('Key Info List', 'ID', '', ['Title', 'Company_x0020_Code','Full_x0020_Name'])
                    .then(
                        function(data) {
                            bgList = data;
                            for (var i in bgList) {
                                $('#BG_Replace_Field_DropDownChoice').append('<option value="' + bgList[i][0] + '">' + bgList[i][0] + ' - ' + bgList[i][2] + '</option>');
                            }
                            $('#BG_Replace_Field_DropDownChoice').val($("input[title^='BG']").val());
                            getListItemsByKey('Amount List', 'Title', RIDText, ['Description', 'Amount', 'Currency'])
                            .then(
                                function(data) {
                                    for (var i in data) {
                                        $('#AmountList .selectable').append('<tr><td>' + RIDText + '</td><td>' + data[i][0] + '</td><td>' + data[i][1] + '</td><td>' + data[i][2] + '</td></tr>');
                                    }
                                    getListItemsByKey('Approver List', 'Title', RIDText, ['Approval_x0020_Level', 'Approver_x0020_Account', 'Approver_x0020_Name'])
                                    .then(
                                        function(data) {
                                            for (var i in data) {
                                                $('#ApproverList .selectable').append('<tr><td>' + RIDText + '</td><td>' + data[i][0] + '</td><td class="hidden">' + data[i][1] + '</td><td>' + data[i][2] + '</td></tr>');
                                            }
                                            if ($('#idAttachmentsTable').find('tbody').length > 0) {
                                                $('#Attachments').show();
                                            }
                                            /**
                                             * @event initializePeoplePicker_ApproverPicker
                                             * Initial people picker in dialog with function {@link initializePeoplePicker}
                                             *
                                             * @since FormActions 1.2 beta
                                             */
                                            if($('#ApproverPicker').length > 0) {
                                                initializePeoplePicker('ApproverPicker')
                                                .then(
                                                    function(){
                                                        $('#ApproverPicker_TopSpan').attr('title', 'Approver Picker');
                                                        $('#ApproverPicker_TopSpan_EditorInput').attr('title', 'Approver Picker Editor');
                                                        /**
                                                         * @event attachUserFieldFunction_ApproverPicker
                                                         * Attach the automatically get user information function to *"Approver Picker"* people picker, see details {@link attachUserFieldFunction}
                                                         */
                                                        attachUserFieldFunction('Approver Picker', ['Approver Account', 'Approver Name'], ['AccountName', 'PreferredName']);
                                                    }
                                                );
                                                $('#ApproverListDialog').css('paddingBottom', '150px');
                                            }
                                            /**
                                             * @event WaitingDialog_close
                                             * Close the WaitingDialog after all events executed successfully.
                                             */
                                            WaitingDialog.close();
                                            getListItemsByKey('Vendor Master Data', 'ID', '', ['Title', 'Vendor_x0020_Name'])
                                            .then(
                                                function(data) {
                                                    vendorList = data;
                                                    $("input[title^='Vendor Code']").change(function() {
                                                        var result = '';
                                                        for (var i in vendorList) {
                                                            if ($(this).val() === vendorList[i][0]) {
                                                                result = vendorList[i][1];
                                                            }
                                                        }
                                                        if (result !== '') {
                                                            $("input[title^='Vendor Name']").val(result);
                                                        } else {
                                                            $("input[title^='Vendor Name']").val('');
                                                        }
                                                    });
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
                /**
                 * @event ItemList_show
                 * Show every ItemsList except Attachments
                 */
                $('.ItemsList:not(#Attachments)').show();
        }


    } else if($("span[data-displayname='Request ID']").children().length != 0 && $("input[title^='Request ID']").val() != '') {

        //Setup readonly fields
        $("input[id^='Title']").css('width','550');
        $("input[id^='Title']").attr('readonly', 'readonly');
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

        getListItemsByKey('Key Info List', 'ID', '', ['Title', 'Company_x0020_Code','Full_x0020_Name'])
        .then(
            function(data) {
                bgList = data;
                for (var i in bgList) {
                    $('#BG_Replace_Field_DropDownChoice').append('<option value="' + bgList[i][0] + '">' + bgList[i][0] + ' - ' + bgList[i][2] + '</option>');
                }
                $('#BG_Replace_Field_DropDownChoice').val($("input[title^='BG']").val());
                getListItemsByKey('Amount List', 'Title', RIDText, ['Description', 'Amount', 'Currency'])
                .then(
                    function(data) {
                        for (var i in data) {
                            $('#AmountList .selectable').append('<tr><td>' + RIDText + '</td><td>' + data[i][0] + '</td><td>' + data[i][1] + '</td><td>' + data[i][2] + '</td></tr>');
                        }
                        getListItemsByKey('Approver List', 'Title', RIDText, ['Approval_x0020_Level', 'Approver_x0020_Account', 'Approver_x0020_Name'])
                        .then(
                            function(data) {
                                for (var i in data) {
                                    $('#ApproverList .selectable').append('<tr><td>' + RIDText + '</td><td>' + data[i][0] + '</td><td class="hidden">' + data[i][1] + '</td><td>' + data[i][2] + '</td></tr>');
                                }
                                if ($('#idAttachmentsTable').find('tbody').length > 0) {
                                    $('#Attachments').show();
                                }
                                /**
                                 * @event initializePeoplePicker_ApproverPicker
                                 * Initial people picker in dialog with function {@link initializePeoplePicker}
                                 *
                                 * @since FormActions 1.2 beta
                                 */
                                if($('#ApproverPicker').length > 0) {
                                    initializePeoplePicker('ApproverPicker')
                                    .then(
                                        function(){
                                            $('#ApproverPicker_TopSpan').attr('title', 'Approver Picker');
                                            $('#ApproverPicker_TopSpan_EditorInput').attr('title', 'Approver Picker Editor');
                                            /**
                                             * @event attachUserFieldFunction_ApproverPicker
                                             * Attach the automatically get user information function to *"Approver Picker"* people picker, see details {@link attachUserFieldFunction}
                                             */
                                            attachUserFieldFunction('Approver Picker', ['Approver Account', 'Approver Name'], ['AccountName', 'PreferredName']);
                                        }
                                    );
                                    $('#ApproverListDialog').css('paddingBottom', '150px');
                                }
                                /**
                                 * @event WaitingDialog_close
                                 * Close the WaitingDialog after all events executed successfully.
                                 */
                                WaitingDialog.close();
                                getListItemsByKey('Vendor Master Data', 'ID', '', ['Title', 'Vendor_x0020_Name'])
                                .then(
                                    function(data) {
                                        vendorList = data;
                                        $("input[title^='Vendor Code']").change(function() {
                                            var result = '';
                                            for (var i in vendorList) {
                                                if ($(this).val() === vendorList[i][0]) {
                                                    result = vendorList[i][1];
                                                }
                                            }
                                            if (result !== '') {
                                                $("input[title^='Vendor Name']").val(result);
                                            } else {
                                                $("input[title^='Vendor Name']").val('');
                                            }
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
        /**
         * @event ItemList_show
         * Show every ItemsList except Attachments
         */
        $('.ItemsList:not(#Attachments)').show();
    } else {

        //Hide and show div by Scrap Type, meanwhile retrieve list content with JSOM function
        var RIDString = $("span[data-displayname='Request ID']").text();
        var trimText = /\S+/;
        RIDText = trimText.exec(RIDString)[0];
        var myId = GetUrlKeyValue('ID');

        if ($("span[data-displayname='Cost Center']").text().trim() !== '') {
            $('#coSelect').html('<b>Cost Center:</b>');
        } else {
            $('#coSelect').html('<b>Order Number:</b>');
        }

        if ($("span[data-displayname='Status']").text().trim() === 'Rejected') {
            var jumpURL = 'https://ledvance365.sharepoint.com/sites/APR/Lists/Payment%20Applications/NewForm.aspx?RID=' + RIDText;
            $("input[id$='diidIOGoBack']").parent().append("<input type='button' value='Correct' id='Correct' onclick=\"STSNavigate(\'" + jumpURL + "\');\">");
        }

        getListItemsByKey('Amount List', 'Title', RIDText, ['Description', 'Amount', 'Currency'])
        .then(
            function(data) {
                for (var i in data) {
                    $('#AmountList .selectable').append('<tr><td>' + RIDText + '</td><td>' + data[i][0] + '</td><td>' + data[i][1] + '</td><td>' + data[i][2] + '</td></tr>');
                }
                getListItemsByKey('Approver List', 'Title', RIDText, ['Approval_x0020_Level', 'Approver_x0020_Account', 'Approver_x0020_Name'])
                .then(
                    function(data) {
                        for (var i in data) {
                            $('#ApproverList .selectable').append('<tr><td>' + RIDText + '</td><td>' + data[i][0] + '</td><td class="hidden">' + data[i][1] + '</td><td>' + data[i][2] + '</td></tr>');
                        }
                        getListItemsByKey('Workflow History', 'Title', RIDText, ['Action_x0020_Time', 'Role', 'Action_x0020_Person', 'Response', 'Comments'])
                        .then(
                            function(data) {
                                for (var i in data) {
                                    var actTime = moment(data[i][0]).format('YYYY-MM-DD HH:mm:ss');
                                    var actName = '';
                                    if (data[i][2] !== null) {
                                        actName = data[i][2].get_lookupValue();
                                    }
                                    var actComment = '';
                                    if (data[i][4] !== null) {
                                        actComment = data[i][4];
                                    }
                                    $('#HistoryList table').append('<tr><td>' + actTime + '</td><td>' + data[i][1] + '</td><td>' + actName + '</td><td>' + data[i][3] + '</td><td>' + actComment + '</td></tr>');
                                }
                                if ($('#idAttachmentsTable').find('tbody').length > 0) {
                                    $('#Attachments').show();
                                }
                                /**
                                 * @event WaitingDialog_close
                                 * Close the WaitingDialog after all events executed successfully.
                                 */
                                WaitingDialog.close();
                            }
                        );
                    }
                );
            }
        );
        /**
         * @event ItemList_show
         * Show every ItemsList except Attachments
         */
        $('.ItemsList:not(#Attachments)').show();
    }
}

/**
 * @method PreSaveAction
 * ###In this function you can handle field validation and additional changes before the form will be saved. Return true, if form can be saved, false if doesn’t
 * ###Several suggestions:
 *     - Validation rules should more focus on additional contents
 *     - SharePoint original list item will validate itself by column type
 *     - Do not use async function inside since it doesn't support, if have to use async functions, use validateAndSaveForm function instead.
 * @preventable
 * @deprecated 1.3 beta Use {@link #validateAndSaveForm} instead
 *
 * @since FormActions 1.0 beta
 */
//function PreSaveAction() {}
/**
 * @method validateAndSaveForm
 * ###This is the key function to replace original PreSaveAction function, confirm if current form passes validation
 *     - Since we have to manually call originalSaveButtonClickHandler at last, validation should be done here
 *     - Return false will prevent form saving, if true then form will save
 * @preventable
 *
 * @since FormActions 1.3 beta
 */
function validateAndSaveForm() {
    var formStatus;
    if($('#AmountList .selectable tr').length === 1) {
        formStatus = 'No request Item.';
    } else if($('#ApproverList .selectable tr').length === 1) {
        formStatus = 'No approver inserted.';
    } else {
        formStatus = 'pass';
    }
    console.log('Current form status: ' + formStatus);

    if(formStatus === 'pass') {
        //Confirm to save the request
        var saveConfirm = confirm('Please confirm to submit the request.');
        if(saveConfirm === true) {
            /**
             * @event CWEClient_assignGuid
             * Create a customized variable base on class CWEClient, and assign GUID
             */
            /*var cweClient = new CWEClient({
                guidFieldName: 'Request_x0020_ID',
                workflowDefinitionCode: 'apacPaymentRequest',
                initStateCode: 'Prepare',
                preSaveActionBefore: false
            });*/
            //Save actions
            if($("input[id^='Status_']").val() === 'Draft') {
                $("input[id^='Status_']").val('Submitted');
                $('#ctl00_exitfullscreenmodeBtn').click();
                formSaveFunction();
            } else if($("input[id^='Status_']").val() === 'Rework') {
                $("input[id^='Status_']").val('Resubmitted');
                $('#ctl00_exitfullscreenmodeBtn').click();
                formSaveFunction();
            }
        } else {
            return false;
        }
    } else {
        alert('The form cannot save because: \n' + formStatus);
        return false;
    }
}

/**
<<<<<<< HEAD
 * @method formSaveFunction
 * ###This is the key function to replace original PreSaveAction function, allow async function running inside
 * ###Several suggestions:
 *     - Organize all the saving/deleting functions in here
 *     - Remember to record save button original function in init function
 *
 * @since FormActions 1.4 beta
=======
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
>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
 */
function formSaveFunction() {
    //Define vars will use
    var actionCase = [];
    var functionCase = [];
    //Get amount list and approver list column names, then push into arrays
    $('#AmountList .selectable th').each(function(){
        amountColName.push($(this).attr('title'));
    });
    $('#ApproverList .selectable th').each(function(){
        approverColName.push($(this).attr('title'));
    });

    //Get new amount list item content, then push into newAmountItemContents
    for (var i = 0; i < $('#AmountList .selectable tr').length; i++){
        var amountGetItem = $('#AmountList .selectable tr:eq(' + i + ').new');
        var amountGetItems = [];
        var newAmountGetItems = {};
        amountGetItem.find('td').each(function(){
            amountGetItems.push($(this).text());
        });
        if (amountGetItems.length > 0) {
            for (var x = 0; x < amountColName.length; x++) {
                newAmountGetItems[amountColName[x]] = amountGetItems[x];
            }
            newAmountItemContents.push(newAmountGetItems);
        }
    }
    //Get new approver list item content, then push into newApproverItemContents
    for (var i = 0; i < $('#ApproverList .selectable tr').length; i++){
        var approverGetItem = $('#ApproverList .selectable tr:eq(' + i + ').new');
        var approverGetItems = [];
        var newApproverGetItems = {};
        approverGetItem.find('td').each(function(){
            approverGetItems.push($(this).text());
        });
        if (approverGetItems.length > 0) {
            for (var x = 0; x < approverColName.length; x++) {
                newApproverGetItems[approverColName[x]] = approverGetItems[x];
            }
            newApproverItemContents.push(newApproverGetItems);
        }
    }

    //Get updated amount list item content, then push into updateItemContents
    for (var i = 0; i < $('#AmountList .selectable tr').length; i++){
        var updateGetItem = $('#AmountList .selectable tr:eq(' + i + ').updated');
        var updateTemp = [];
        var updateGetItems = {};
        updateGetItem.find('td').each(function(){
            updateTemp.push($(this).text());
        });
        if (updateTemp.length > 0) {
            for (var x = 0; x < amountColName.length; x++) {
                updateGetItems[amountColName[x]] = updateTemp[x];
            }
            updateItemContents.push(updateGetItems);
        }
    }
    //Confirm each array status and push the result into array actionCase
    if (newAmountItemContents.length > 0) {
        actionCase.push({
            'valid': '1',
            'function': 'createListItem("Amount List", newAmountItemContents)'
        });
    } else {
        actionCase.push({'valid': '0'});
    }
    if (newApproverItemContents.length > 0) {
        actionCase.push({
            'valid': '1',
            'function': 'createListItem("Approver List", newApproverItemContents)'
        });
    } else {
        actionCase.push({'valid': '0'});
    }
    if (updateItemContents.length > 0) {
        actionCase.push({
            'valid': '1',
            'function': 'updateListItem("Amount List", updateItemContents);'
        });
    } else {
        actionCase.push({'valid': '0'});
    }
    if (itemListIDs.length > 0) {
        actionCase.push({
            'valid': '1',
            'function': 'deleteListItem("Amount List", itemListIDs);'
        });
    } else {
        actionCase.push({'valid': '0'});
    }
    if (approverListIDs.length > 0) {
        actionCase.push({
            'valid': '1',
            'function': 'deleteListItem("Approver List", approverListIDs);'
        });
    } else {
        actionCase.push({'valid': '0'});
    }
    for (var i in actionCase) {
        if (actionCase[i].valid === '1') {
            var tempFunction = new Function(actionCase[i].function);
            functionCase.push(tempFunction);
        }
    }
    if (functionCase.length > 0) {
        $.when(
            $.each(functionCase, function(index, value) {
                value.call();
            })
        ).then(
            function(result) {
                console.log(result);
                originalSaveButtonClickHandler();
            },
            function(err) {
                console.log('Error: ');
                console.log(err);
            }
        );
    } else {
        originalSaveButtonClickHandler();
    }
}
/**
 * @class createRID
 * #Create Request ID (RID) with 2 different types, modified to jQuery Deferred function since FormActions 1.3 beta
 *
 * @param  {String}   appPrefix >Prefix to identify current application
 * @param  {String}   type      >Predefined 2 types: time and autoNumber
 * @return {String}             >New Request ID (RID)
 *
 * @since FormActions 1.0 beta
 *
 * #See the example 1 for type "time":
 *     createRID('prefix', 'time')
 *     .then(
 *         function(data) {
 *             Success...
 *         },
 *         function(error) {
 *             Error...
 *         }
 *     );
 *
 * #See the example 2 for type "autoNumber":
 *     createRID('prefix', 'autoNumber')
 *     .then(
 *         function(data) {
 *             Success...
 *         },
 *         function(error) {
 *             Error...
 *         }
 *     );
 */
function createRID(appPrefix, type) {

    var dfd = $.Deferred();
    var now = moment();
    var RID = '';
    //Setup for type "time"
    if(type === 'time') {
        RID = appPrefix + now.format('YYMMDDHHmmss');
        //Setup for type "autoNumber"
    } else if(type === 'autoNumber') {
        RID = appPrefix + now.format('YYWW') + autoNumber;
    }

    dfd.resolve(RID);
    return dfd.promise();
}

/**
 * @class setUserFieldValue
 * #Input user field by specific user account
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
 * #Retrieve user field value matches returnProperty, modified to jQuery Deferred function since FormActions 1.3 beta
 * @param  {String}   fieldName      >The user field title
 * @param  {String}   returnProperty >The property needs to retrieve
 * @return {String}                  >The content of returnProperty
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     getUserFieldValue('PeoplePicker', 'Description')
 *     .then(
 *         function(data) {
 *             Success...
 *         },
 *         function(error) {
 *             Error...
 *         }
 *     );
 */
function getUserFieldValue(fieldName, returnProperty) {
    var dfd = $.Deferred();
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
    dfd.resolve();
    return dfd.promise();
}

/**
 * @class attachUserFieldFunction
 * #Attach function to specific user field
 * @param  {String} fieldName   >The user field title
 * @param  {String[]} inputFields >The fields array to input properties
 * @param  {String[]} keyValues   >The values array to input into specific fields
 *
 * @since FormActions 1.2 beta
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

        var attachAccount, originDiv;
        var attachUser = new Osram.UserInfo();
        if(this.TopLevelElementId.slice(-7) === 'TopSpan') {
            originDiv = $('#' + this.TopLevelElementId.replace('_TopSpan', ''));
        }
        var users = this.GetAllUserInfo();
        if(users.length !== 0) {
            for(var i = 0; i < users.length; i++) {
                var user = users[i];
                for(var userProperty in user) {
                    if(userProperty === 'Key') {
                        attachAccount = user[userProperty];
                        
                        //Setup attachUser to get properties
                        var encodeAccount = encodeURIComponent(attachAccount);
                        attachUser.set_account(encodeAccount);
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
 * #Create item for specific SP list with given data, modified to jQuery Deferred function since FormActions 1.3 beta
 * @param  {String}   listTitle   >The SharePoint list name
 * @param  {String[]}   colName     >The columns to insert data in
 * @param  {String/Number/Boolean[]}   itemContent >The content to insert to item columns
 *
 * @since FormActions 1.0 beta
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     createListItem('list', [{'Title': 'Title1', 'Content': 'Content1'}, {'Title': 'Title2', 'Content': 'Content2'}])
 *     .then(
 *         function(data){
 *             Success...
 *         },
 *         function(error){
 *             Error...
 *         }
 *     );
 */
function createListItem(listTitle, itemContent) {

    var dfd = $.Deferred();
    //Locate list by listTitle
    var clientContext = new SP.ClientContext();
    var list = clientContext.get_web().get_lists().getByTitle(listTitle);

    //Create list item
    for (var x in itemContent) {
        var newItem = list.addItem();
        var temp = itemContent[x];
        for (var i in temp) {
           newItem.set_item(i, temp[i]);
        }
        newItem.update();
    }
    clientContext.executeQueryAsync(
        function() {
            dfd.resolve();
        },
        function (sender,args) {
            //alert('Item creation failed: ' + args.get_message() + '\n' + args.get_stackTrace());
            dfd.reject(args);
        }
    );
    return dfd.promise();
}

/**
 * @class updateListItem
 * #Update specific item in specific SP list with given data, modified to jQuery Deferred function since FormActions 1.3 beta
 * @param  {String}   listTitle   >The SharePoint list name
 * @param  {String[]}   colName     >The columns to insert data in
 * @param  {String/Number/Boolean[]}   >itemContent The content to insert to item columns
 *
 * @since FormActions 1.0 beta
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     updateListItem('list', [{'Id': 1, 'Title': 'Title1', 'Content': 'Content1'}, {'Id': 2, 'Title': 'Title2', 'Content': 'Content2'}])
 *     .then(
 *         function(data){
 *             Success...
 *         },
 *         function(error){
 *             Error...
 *         }
 *     );
 */
function updateListItem(listTitle, itemContent) {

    var dfd = $.Deferred();
    //Locate list by listTitle
    var clientContext = new SP.ClientContext();
    var list = clientContext.get_web().get_lists().getByTitle(listTitle);

    //Update list item
    for (var x in itemContent) {
        var temp = itemContent[x];
        var updateItem = list.getItemById(temp.ID);
        for (var i in temp) {
            if (i !== 'ID') {
                updateItem.set_item(i, temp[i]);
            }
        }
        updateItem.update();
    }

    clientContext.executeQueryAsync(
        function() {
            dfd.resolve();
        },
        function (sender,args) {
            //alert('Item updating failed: ' + args.get_message() + '\n' + args.get_stackTrace());
            dfd.reject(args);
        }
    );
    return dfd.promise();
}

/**
 * @class deleteListItem
 * #Delete specific items in specific SP list, modified to jQuery Deferred function since FormActions 1.3 beta
 * @param  {String}   listTitle >The SharePoint list name
 * @param  {Number[]}   listIDs   >The item IDs to be delete
 *
 * @since FormActions 1.0 beta
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     deleteListItem('list', [1, 2, 3])
 *     .then(
 *         function(data){
 *             Success...
 *         },
 *         function(error){
 *             Error...
 *         }
 *     );
 */
function deleteListItem(listTitle, listIDs) {

    var dfd = $.Deferred();
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
            dfd.resolve();
        },
        function (sender,args) {
            //alert('Item deletion failed: ' + args.get_message() + '\n' + args.get_stackTrace());
            dfd.reject(args);
        }
    );
    return dfd.promise();
}

/**
 * @class getListItemsByKey
 * #This is the very important function to retrieve data from a specific list with key value, modified to jQuery Deferred function since FormActions 1.3 beta
 * @param  {String}   listTitle   >The SharePoint list needs to query
 * @param  {String}   keyColName  >The information query column
 * @param  {String/Number/Boolean}   keyField    >The information needs to query with
 * @param  {String[]}   queryFields >The information needs to query out
 * @return {Object} collListItem is the return data, requires onQuerySucceeded function handel first
 * 
 * @since FormActions 1.0 beta
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     getListItemsByKey('list', 'ID', 1, ['Title', 'Column'])
 *     .then(
 *         function(data){
 *             Success...
 *         },
 *         function(error){
 *             Error...
 *         }
 *     );
 */
function getListItemsByKey(listTitle, keyColName, keyField, queryFields) {

    this.listTitle = listTitle;
    this.keyColName = keyColName;
    this.keyField = keyField || '';
    this.queryFields = queryFields || ['Title'];
    this.dfd = $.Deferred();

    //Locate list by listTitle
    var clientContext = new SP.ClientContext();
    var list = clientContext.get_web().get_lists().getByTitle(listTitle);

    var camlQuery = new SP.CamlQuery();
    if (keyField !== '') {
        camlQuery.set_viewXml(
            '<View Scope="Recursive"><Query><Where><Eq><FieldRef Name=\'' + keyColName + '\'/><Value Type=\'Text\'>' + keyField + '</Value></Eq></Where></Query></View>'
        );
    } else {
        camlQuery.set_viewXml(
            '<View Scope="Recursive"><Query><Where><IsNotNull><FieldRef Name=\'' + keyColName + '\'/></IsNotNull></Where></Query></View>'
        );
    }
    this.collListItem = list.getItems(camlQuery);

    clientContext.load(collListItem);
    clientContext.executeQueryAsync(//onQuerySucceeded, onQueryFailed);
        function() {
            var listItemInfos = [];
            var listItemEnumerator = collListItem.getEnumerator();

<<<<<<< HEAD
            //console.log(queryFields);
            /**
             * @enum {Object} listItemEnumerator Enumerate the query result list items
             */
            while (listItemEnumerator.moveNext()) {
                var listItem = listItemEnumerator.get_current();
                var listItemInfo = [];
                for (var i in queryFields) {
                    listItemInfo.push(listItem.get_item(queryFields[i]));
                }
                listItemInfos.push(listItemInfo);
            }
            //console.log(listItemInfos);
            dfd.resolve(listItemInfos);
        },
        function(sender, args) {
            dfd.reject(args);
        }
    );
    return dfd.promise();
=======
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
>>>>>>> 56607b3573f09b73e79ad4f2a4af243efdb45a34
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
        numberList.push(numeral($('#' + itemList + ' tr:eq(' + i + ') td:eq(' + calcIndex + ')').text()).value());
    }

    //Calculate the Max and Sum result and return
    numberList.sort(function(a, b){
        return a - b;
    });
    var maxResult = numberList[numberList.length-1];
    var sumResult = numberList.reduce(function(x, y) {
        return x + y;
    });
    return [numeral(maxResult).format('0,0.00'), numeral(sumResult).format('0,0.00')];
}

/**
 * @class initializePeoplePicker
 * The Microsoft JSOM function to initial a self designed people picker
 * @param  {String}   peoplePickerId >The HTML id of text input
 *
 * @since FormActions 1.2 beta
 *
 * @since FormActions 1.2 beta
 *
 * #See the example:
 *     initializePeoplePicker('myInput')
 *     .then(
 *         function(data){
 *             Success...
 *         },
 *         function(error){
 *             Error...
 *         }
 *     );
 */
function initializePeoplePicker(peoplePickerId) {
    var dfd = $.Deferred();
    //Create a schema to store picker properties, and set the properties.
    var schema = {};
    schema.PrincipalAccountType = 'User,DL,SecGroup,SPGroup';
    schema.SearchPrincipalSource = 15;
    schema.ResolvePrincipalSource = 15;
    schema.AllowMultipleValues = false;
    schema.MaximumEntitySuggestions = 30;
    schema.Width = '370px';

    //Render and initialize the picker. Pass the ID of the DOM element that contains the picker, an array of initial PickerEntity objects to set the picker value, and a schema that defines picker properties.
    this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerId, null, schema);

    dfd.resolve();
    return dfd.promise();
}
