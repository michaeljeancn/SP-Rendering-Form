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
 * Setup for global vars: Temporary vendor list to retrieve from SharePoint List
 * @type {Array}
 */
var vendorList = [];
/**
 * Setup for global vars: Amount Column name list to save to SharePoint list
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
 * Setup for global vars: Amount item list to update to SharePoint list
 * @type {Array}
 */
var updateItemContents = [];
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
 * Setup for global vars: Mobile subsidy balance list
 * @type {Array}
 */
var maBalances = [];
/**
 * @property RIDText, autoNumber, WaitingDialog -
 * Setup for global vars: All the key variables in form
 * @type {String}
 */
var RIDText,
    autoNumber,
    bgIndex,
    incomplete,
    WaitingDialog;

var originalSaveButtonClickHandler = function(){};
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
    if (saveButton.length !== 0) {
        originalSaveButtonClickHandler = saveButton[0].onclick;
    }
    $(saveButton).attr("onclick", "validateAndSaveForm()"); //change onclick to execute our custom validation and save function

    /**
     * @event Claim_Type_change
     * FieldName and field change base on ClaimType select
     * Attach the function to *"Claim Type"* selector's change method
     * var typeText Current selector's value
     * Other related field will change based on the value change
     */
    $("select[title^='Claim Type']").change(function () {
        var typeText = $("select[title^='Claim Type']").val();
        if (typeText === 'Project') {
            $("span[data-displayname='Cost Center']").hide();
            $("span[data-displayname='Order Number']").show();
            $(".changeLabel b").text('Order Number:');
            $("input[title^='Cost Center']").val('');
        } else {
            $("span[data-displayname='Cost Center']").show();
            $("span[data-displayname='Order Number']").hide();
            $(".changeLabel b").text('Cost Center:');
            $("input[title^='Order Number']").val('');
        }
    });

    /**
     * @event BG_change
     * Retrieve key information by BG selector
     * If *"BG"* selecter's value changed and not blank, insert the retrieved data into variable *"currencyList"* (array).
     */
    $("select[title^='BG']").change(function () {
        if ($(this).val() !== '') {
            $("input[title^='BG']").val($(this).val());
            for (var i in currencyList) {
                if (currencyList[i][0] === $(this).val()) {
                    bgIndex = i;
                }
            }
            $("input[title^='Company Code']").val(currencyList[bgIndex][1]);
            $("input[title^='Currency']").val(currencyList[bgIndex][3]);
            $("input[title^='Prefix']").val(currencyList[bgIndex][4]);
            $("#AmountList7").val(currencyList[bgIndex][3]);
            var approver1 = currencyList[bgIndex][5];
            var textRID = $("input[title^='Request ID']").val();

            var requestTitle = $(this).val() + '-' + RIDText;
            $("input[id^='Title']").val(requestTitle);

            /**
             * @event getListItemsByKey_Account
             * For details please check: {@link getListItemsByKey}.
             * Retrieve expense type (FA Account) from PCV Account list base on BG selection.
             * Result is Accounts information of BG, return as Array and assign to global accountList within promise function.
             */
            getListItemsByKey('PCV Account', 'BG', $(this).val(), ['Title', 'English_x0020_Description', 'Chinese_x0020_Description', 'Claim_x0020_Type', 'ID'])
            .then(
                function (data) {
                    accountList = data;
                    getListItemsByKey('Vendor Relation', 'Title', '', ['Title', 'Vendor_x0020_Code'])
                        .then(
                            function (data) {
                                vendorList = data;
                            }
                        );
                }
            );

            /**
             * @event insertApprover1
             * For BG LMA and LHK, the 1st approver is specific person
             */
            if (approver1 !== null && $('#ApproverList .selectable tr').length === 1) {
                //Must add 'i:0#.f|membership|' as prefix of account
                var attachUser = new Osram.UserInfo();
                //Setup attachUser to get properties
                var encodeAccount = encodeURIComponent('i:0#.f|membership|' + approver1);
                attachUser.set_account(encodeAccount);
                attachUser.set_async(false);
                attachUser.getUserProfilePropertiesFor();
                console.log(attachUser);
                var appendTr = '<tr class="ui-widget-content new"><td>' + textRID + '</td><td>Approver1</td><td class="hidden">' + attachUser._userProfileProperties.AccountName + '</td><td>' + attachUser._userProfileProperties.PreferredName + '</td></tr>';
                $('#ApproverList .selectable').append(appendTr);
            } else if (approver1 === null && $('#ApproverList .selectable tr').length !== 1 && $("input[id^='Status_']").val() === 'Draft') {
                $('#ApproverList .selectable tr:eq(1)').remove();
            }
        }
    });

    /**
     * @event Attachments_show
     * Show Attachments list only when there is Attachment(s) inside.
     */
    if ($('#idAttachmentsTable').children().length === 0) {
        $('#attachOKbutton').click(function () {
            $('#Attachments').show();
            var oldLink = $("a[href^='javascript:RemoveLocal']:last").attr('href').replace('javascript:', '');
            var newLink = oldLink + ";if($('#idAttachmentsTable tbody').children().length===0)$('#Attachments').hide();return false";
            $("a[href^='javascript:RemoveLocal']:last").attr('onclick', newLink);
            $("a[href^='javascript:RemoveLocal']:last").attr('href', '#');
        });
    } else {
        $('#Attachments').hide();
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
    $('.btnAdd').click(function () {
        var divId = $(this).parent().parent().attr('id');
        var dialogId = divId + 'Dialog';
        $('#' + dialogId).dialog('open');
        $('#' + dialogId).next().find('.ui-button:first').attr('disabled', 'disabled');
        //Reset all content
        if (divId === 'ApproverList') {
            $('#' + divId + '2').val('Approver' + $('#' + divId + ' tbody').children().length);
            $("a[id^='ApproverPicker']").click();
            $('#ApproverPicker').attr('style', '');
            $('#ApproverPicker').parent().find('.ms-formvalidation').remove();
        } else {
            $('#' + dialogId + ' .text').val('');
            if ($("input[title^='Employee Number']").val() !== '') {
                $.each(vendorList, function (x, arr) {
                    if (arr[0] === $("input[title^='Employee Number']").val()) {
                        $("input[title^='Vendor']").val(arr[1]);
                    }
                });
                if ($("input[title^='Vendor']").val() === '') {
                    var myVendor = currencyList[bgIndex][4] + $("input[title^='Employee Number']").val();
                    $("input[title^='Vendor']").val(myVendor);
                }
            }
        }

        //Mark status as add
        $('#' + dialogId + ' .Status').val('add');
        //Retrieve expense type base on Claim Type
        if (divId === 'AmountList') {
            if ($('#' + divId + ' table tbody').children().length !== 1 && $('#AmountList table tbody .hidden:eq(2)').text() === '66230030') {
                console.log('Disable the choice');
                $('#AmountList2').val('66230030');
                $('#AmountList3').val('Mobile Allowance');
                $('.MSR').show();
                $('#AmountList3').attr('disabled', 'disabled');
            } else {
                if ($('#AmountList3').attr('disabled') === 'disabled') {
                    $('#AmountList3').removeAttr('disabled');
                }
                $.each(accountList, function (x, arr) {
                    $.each(arr, function (y, val) {
                        if ($.isArray(val)) {
                            if ($.inArray($("select[title^='Claim Type']").val(), val) != -1) {
                                console.log(arr);
                                if (arr[2] === null) {
                                    arr[2] = '';
                                }
                                $('#TypeList tbody').append("<tr><td>" + arr[4] + "</td><td>" + arr[0] + "</td><td>" + arr[1] + "</td><td>" + arr[2] + "</td></tr>");
                            }
                        }
                    });
                });
                if ($('#' + divId + ' table tbody').children().length !== 1 && $('#AmountList table tbody .hidden:eq(2)').text() !== '66230030' && $('#TypeList tbody td:first').text() === '1') {
                    console.log('Remove mobile subsidy line');
                    $('#TypeList tbody tr:first').remove();
                }
            }
        }
        return false;
    });


    /**
     * @event btnEdit_click
     * Setup btnEdit to enable list line editing dialog
     */
    $('.btnEdit').click(function () {
        var divId = $(this).parent().parent().attr('id');
        var dialogId = divId + 'Dialog';
        $('#' + dialogId).dialog('open');

        //Retrieve expense type base on Claim Type
        if (divId === 'AmountList') {
            if ($('tr.ui-selected td:eq(1)').text() === '66230030') {
                editQ = parseInt($('tr.ui-selected td:eq(3)').text().slice(21, -8));
                $('.MSR').show();
                $('#SeasonSelector').val('Q' + editQ);
            } else {
                $('.MSR').hide();
            }
            $.each(accountList, function (x, arr) {
                $.each(arr, function (y, val) {
                    if ($.isArray(val)) {
                        if ($.inArray($("select[title^='Claim Type']").val(), val) != -1) {
                            console.log(arr);
                            if (arr[2] === null) {
                                arr[2] = '';
                            }
                            $('#TypeList tbody').append("<tr><td>" + arr[4] + "</td><td>" + arr[0] + "</td><td>" + arr[1] + "</td><td>" + arr[2] + "</td></tr>");
                        }
                    }
                });
            });
        }

        //Read content into dialog
        var listContent = [];
        $('tr.ui-selected').find('td').each(function () {
            listContent.push($(this).html());
        });
        for (var i in listContent) {
            var x = parseInt(i) + 1;
            $('#' + divId + x).val(listContent[i]);
        }
        if ($('#AmountList3').val() === '66230030') {
            $('.MSR').show();
        }
        //Setup textarea value/text to enable new line
        var oldStr = $('#' + dialogId + ' textarea').val();
        var newStr = oldStr.replace(/\<\S+\s+\S+\>/g, '\n');
        $('#' + dialogId + ' textarea').val(newStr);

        //Mark status as edit
        $('#' + dialogId + ' .Status').val('edit');
        return false;
    });

    /**
     * @event btnDelete_click
     * Setup btnDelete to delete selected row in items list
     */
    $('.btnDelete').click(function () {
        var divId = $(this).parent().parent().attr('id');

        //Save list ID for deleted items
        if ($('tr.ui-selected td:eq(1)').text() === RIDText) {
            listIDs.push($('tr.ui-selected td:first').text());
        }

        if ($('tr.ui-selected td:eq(1)').text() === '66230030') {
            deletedQ = parseInt($('tr.ui-selected td:eq(3)').text().slice(21, -8));
            deletedLeft = $('tr.ui-selected td:eq(7)').text();
            maBalances[deletedQ - 1] = maBalances[deletedQ - 1] + numeral(deletedLeft).value();
        }
        $('tr.ui-selected').remove();

        if ($('#' + divId + ' table tbody').children().length === 1) {
            //$('#MPrice').text('0.00');
            $('#TPrice').text('0.00');
            $('#' + divId + ' .btnEdit').hide();
            $('#' + divId + ' .btnDelete').hide();
            $("select[title^='BG']").removeAttr('disabled');
            $("select[title^='Claim Type']").removeAttr('disabled');
            $('#ApproverList').show();
        } else {
            //Calculate for Max and Total amount when delete item
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
        stop: function () {
            var divId = $('tr.ui-selected').parent().parent().parent().attr('id');
            $('#' + divId + ' table tbody tr:first').attr('class', '');
            $('#' + divId + ' table tbody tr:first td').attr('class', '');
            if ($("select[title^='BG']").val() === 'LAPAC' || $("select[title^='BG']").val() === 'LMA') {
                $('#' + divId + ' table tbody tr:eq(1)').attr('class', 'new');
            }
            if ($('#' + divId + ' tr.ui-selected').length === 1) {
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
    $('#AmountList6').change(function () {
        if ($('.MSR').css('display') === 'none') {
            if ($(this).val() !== '') {
                var amount = numeral($(this).val());
                $(this).val(amount.format('0,0.00'));
            }
        } else {
            if ($(this).val() !== '' && numeral($(this).val()).value() <= numeral($('#SeasonBalance b').text()).value()) {
                var seasonBalance = numeral($('#SeasonBalance b').text());
                var amount = numeral($(this).val());
                $('#AmountList8').val(seasonBalance.value() - amount.value());
                $(this).val(amount.format('0,0.00'));
                if ($('#AmountListDialog').next().find('.ui-button:first').attr('disabled') === 'disabled') {
                    $('#AmountListDialog').next().find('.ui-button:first').removeAttr('disabled');
                }
                $('#AmountListDialog').next().find('.ui-button:first').removeAttr('disabled');
            } else if ($(this).val() !== '' && numeral($(this).val()).value() > numeral($('#SeasonBalance b').text()).value()) {
                alert('Do not allow \n\nSorry, your claim amount is higher than approved balance, please reduce the amount within the balance to continue; \nor request for Mobile Allowance change first, then continue the application after approved, thanks!');
                $('#AmountListDialog').next().find('.ui-button:first').attr('disabled', 'disabled');
            }
        }
    });

    /**
     * @event AmountList3_click
     * Open the account type list dialog
     */
    $('#AmountList3').click(function () {
        $('#TypeList').dialog('open');
    });

    $('#SeasonSelector').change(function () {
        if ($(this).val() !== '') {
            var now = moment();
            var lastQ = now.quarter();
            var selectedQ = parseInt($(this).val().slice(1));
            var currentY, currentQ, selectedY;
            switch (lastQ) {
                case 4:
                    currentY = now.year() + 1;
                    currentQ = 1;
                    break;
                default:
                    currentY = now.year();
                    currentQ = lastQ + 1;
            }
            if (lastQ > currentQ) {
                selectedY = currentY - 1;
            } else {
                selectedY = currentY;
            }

            if (selectedQ === currentQ) {
                alert('Do not allow claim current quarter allowance!\n\nSorry, your application period is still not active, please try again after current quarter passed.');
                $(this).val('');
                selectedQ = '';
            } else if (selectedQ === lastQ) {
                if ($('#AmountList table tbody').children().length === 1) {
                    $('#ApproverList').hide();
                }
            } else {
                alert('Request for approval!\n\nSorry, your application requests approval, please insert approvers.\nSuggestion:\nCost Center Head / Line Manager, CFO');
                $('#ApproverList').show();
            }
            $('#AmountList4').val('Mobile Expenses for ' + $(this).val() + ', FY' + selectedY);
            $('#SeasonBalance').html('<b>' + maBalances[selectedQ - 1] + '</b>');
        } else {
            $('#SeasonBalance').html('');
        }
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
        width: 800,
        height: 600,
        scrollbars: true,
        modal: true,
        retrieve: true,
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
            $('#DataTables_Table_0').css('width', '780px');
            /**
             * @event accountData_select
             * Listen the datatable **"select"** event and put the values into inputs
             * @param  {Object} e        Mandatory parameter, element
             * @param  {Object} dt       Mandatory parameter, datatable
             * @param  {String} type     Mandatory parameter, selected type
             * @param  {Number} indexes  Mandatory parameter, selected index
             * @return {Array}  dataRow  The real selected data
             *
             * @since FormActions 1.3 beta
             */
            accountData.on('select', function (e, dt, type, indexes) {
                if (type === 'row') {
                    var dataRow = accountData.rows(indexes).data()[0];
                    $('#AmountList2').val(dataRow[1]);
                    $('#AmountList3').val(dataRow[2]);
                    if (dataRow[1] === '66230030') {
                        $('.MSR').show();
                        if ($("input[title^='Employee Number']").val() !== '') {
                            var CurrentEN = $("input[title^='Employee Number']").val();
                            getListItemsByKey('FA User Quota', 'Title', CurrentEN, ['Current_x0020_Mobile_x0020_Allow'])
                                .then(
                                    function (data) {
                                        $('#MMAllowance').html('<b>' + data[0][0] + '</b>');
                                        //Retrieve Mobile Subsidy balances for specific employee
                                        getListItemsByKey('FA User Balance', 'Title', CurrentEN, ['_x0051_1', '_x0051_2', '_x0051_3', '_x0051_4'])
                                            .then(
                                                function (data) {
                                                    maBalances = data[0];
                                                }
                                            );
                                    }
                                );
                        } else {
                            alert('Please input Employee Number to retrieve Mobile Subsidy data!');
                        }
                    } else {
                        $('.MSR').hide();
                        $('#MMAllowance').html('');
                        $('#ApproverList').show();
                    }
                    $('#TypeList').dialog('close');
                }
            });
        }
    });

    /**
     * @event Required_blur
     * Dialog fields validation -- Required
     */
    $('.Required').blur(function () {
        var dialogId = $(this).attr('id').replace(/\d/, 'Dialog');
        if ($(this).val() === '') {
            console.log("It's Blank: " + $(this).attr('id'));
            if ($(this).parent().find('.ms-formvalidation').length === 0) {
                $(this).css('border-color', 'red');
                $(this).parent().append("<span class='ms-formvalidation'><br />The field is required.</span>");
                $('#' + dialogId).next().find('.ui-button:first').attr('disabled', 'disabled');
            }
        } else {
            console.log("It's not Blank (" + $(this).attr('id') + '): ' + $(this).val());
            if ($(this).parent().find('.ms-formvalidation').length !== 0) {
                $(this).attr('style', '');
                $(this).parent().find('.ms-formvalidation').remove();
            }
        }
        if ($('#' + dialogId).find('.ms-formvalidation').length === 0 && $('#' + dialogId).next().find('.ui-button:first').attr('disabled') !== undefined) {
            $('#' + dialogId).next().find('.ui-button:first').removeAttr('disabled');

        }
    });

    /**
     * @event Required Field_blur
     * Rendering form required fields validation
     */
    $("[title$='Required Field']").blur(function () {
        var spanName = $(this).attr('title').replace(' Required Field', '');
        if ($(this).val() === '') {
            console.log("It's Blank: " + $(this).attr('title'));
            if ($("span[data-displayname='" + spanName + "']").parent().find('.ms-formvalidation').length === 0) {
                $(this).css('border-color', 'red');
                $(this).parent().append("<span class='ms-formvalidation'><br />The field is required.</span>");
                incomplete = true;
            }
        } else {
            console.log("It's not Blank (" + $(this).attr('title') + '): ' + $(this).val());
            if ($("span[data-displayname='" + spanName + "']").parent().find('.ms-formvalidation').length !== 0) {
                $(this).attr('style', '');
                $(this).parent().find('.ms-formvalidation').remove();
            }
            if ($('.ms-formvalidation').length === 0) {
                incomplete = false;
            }
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
        width: 650,
        scrollbars: false,
        modal: true,
        buttons: [{
            text: "OK",
            click: function () {
                var dialogId = $(this).attr('id');
                var divId = dialogId.slice(0, dialogId.indexOf('Dialog'));
                var dialogLength = $('#' + dialogId + ' tbody').children().length;

                //Confirm status to decide to Add or Edit
                if ($('#' + dialogId + ' .Status').val() === 'add') {
                    //Add new list item
                    $('#' + divId + ' table tbody').append('<tr class="ui-widget-content new"></tr>');
                    for (var i = 0; i < dialogLength; i++) {
                        var ii = i + 1;
                        console.log('Current th is: $(#' + divId + ' .selectable th:eq(' + i + ')');
                        if ($('#' + divId + ii).is('textarea')) {
                            var textareaVal = $('#' + divId + ii).val();
                            var textareaSave = textareaVal.replace(/\n|\r\n/g, '<br />');
                            console.log(textareaSave);
                            $('#' + divId + ' tr.ui-widget-content:last').append('<td>' + textareaSave + '</td>');
                        } else if ($('#' + divId + ' .selectable th:eq(' + i + ')').attr('class') && $('#' + divId + ' .selectable th:eq(' + i + ')').attr('class').indexOf('hidden') != -1) {
                            $('#' + divId + ' tr.ui-widget-content:last').append('<td class="hidden">' + $('#' + divId + ii).val() + '</td>');
                        } else if ($('#' + divId + ' .selectable th:eq(' + i + ')').attr('class')) {
                            $('#' + divId + ' tr.ui-widget-content:last').append('<td>' + $('#' + divId + ii).val() + '</td>');
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
                        if ($('#' + divId + ii).is('textarea')) {
                            var textareaVal = $('#' + divId + ii).val();
                            var textareaSave = textareaVal.replace(/\n|\r\n/g, '<br />');
                            console.log(textareaSave);
                            $('#' + divId + ' tr.ui-selected').append('<td>' + textareaSave + '</td>');
                        } else if ($('#' + divId + ' .selectable th:eq(' + i + ')').attr('class') && $('#' + divId + ' .selectable th:eq(' + i + ')').attr('class').indexOf('hidden') != -1) {
                            $('#' + divId + ' tr.ui-selected').append('<td class="hidden">' + $('#' + divId + ii).val() + '</td>');
                        } else if ($('#' + divId + ' .selectable th:eq(' + i + ')').attr('class')) {
                            $('#' + divId + ' tr.ui-selected').append('<td>' + $('#' + divId + ii).val() + '</td>');
                        }
                    }
                }

                //Keep the border for table only, not td(s) inside
                $('tr.ui-widget-content').css('border', '0');

                //Calculate for Total amount when save item
                if (divId === 'AmountList') {
                    var result = MaxnTotalCalc(divId, 'Amount');
                    $('#TPrice').text(result[1]);
                    $("input[id^='Total_']").val(result[1]);
                }

                //Update the value of maBalance
                if ($('#AmountList2').val() === '66230030') {
                    var selectedQ = parseInt($('#SeasonSelector').val().slice(1));
                    maBalances[selectedQ - 1] = numeral($('#AmountList8').val()).value();
                }

                $(this).dialog('close');

            }
        }, {
            text: "Cancel",
            click: function () {
                $(this).dialog('close');
            }
        }],
        close: function () {
            if ($(this).next().find('.ui-button:first').attr('disabled') !== undefined) {
                $(this).next().find('.ui-button:first').removeAttr('disabled');
                $(this).find('.ms-formvalidation').remove();
                $(this).find('input').removeAttr('style');
            }

            var dialogId = $(this).attr('id');
            var divId = dialogId.slice(0, dialogId.indexOf('Dialog'));
            if (divId === 'AmountList') {
                $('#AmountList3').html("<option selected='selected' value=''></option>");
                $('#SeasonSelector').val('');
            }
            $('#' + divId + ' .btnEdit').hide();
            $('#' + divId + ' .btnDelete').hide();

            var accountData = $('.datatable table').DataTable();
            accountData.destroy();
            $('.datatable tbody').find('tr').remove();
            $('#SeasonBalance b').text('0');

            $('.MSR').hide();
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
    if ($("span[data-displayname='Request ID']").children().length !== 0 && $("input[title^='Request ID']").val() === '') {

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
            incomplete = true;
            getListItemsByKey('Currency List', 'ID', 1, ['Auto_x0020_Number'])
                .then(
                    function (data) {
                        autoNumber = data[0][0];
                        createRID('PCV-', 'autoNumber')
                        .then(
                            function (data) {
                                RIDText = data;
                                $("input[title^='Request ID']").val(RIDText);
                                //Structure of items list
                                $('.RID').val(RIDText);
                                updateListItem('Currency List', [{
                                    'ID': 1,
                                    'Auto_x0020_Number': autoNumber + 1
                                }])
                                .then(
                                    getListItemsByKey('Currency List', 'ID', '', ['Title', 'Company_x0020_Code', 'Full_x0020_Name', 'Currency', 'Vendor_x0020_Prefix', 'Approver'])
                                    .then(
                                        function (data) {
                                            currencyList = data;
                                            for (var i in currencyList) {
                                                $('#BG_Replace_Field_DropDownChoice').append('<option value="' + currencyList[i][0] + '">' + currencyList[i][0] + ' - ' + currencyList[i][2] + '</option>');
                                            }
                                            /**
                                             * @event initializePeoplePicker_ApproverPicker
                                                * Initial people picker in dialog with function {@link initializePeoplePicker}
                                                *
                                                * @since FormActions 1.2 beta
                                                */
                                            if ($('#ApproverPicker').length > 0) {
                                                initializePeoplePicker('ApproverPicker')
                                                    .then(
                                                        function () {
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
                                             * @event attachUserFieldFunction_PayTo
                                                * Attach the automatically get specific user information function to 'Pay To' people picker, see details: {@link attachUserFieldFunction}
                                                * @since FormActions 1.2 beta
                                                */
                                            attachUserFieldFunction('Pay To', ['Cost Center', 'Employee Number', 'Vendor'], ['Costcenter', 'EmployeeNumber', 'WebSite']);
                                            /**
                                             * @event WaitingDialog_close
                                                * Close the WaitingDialog after all events executed successfully.
                                                */
                                            WaitingDialog.close();
                                        }
                                    )
                                );
                            }
                        );
                    },
                    function (err) {
                        console.log('Error: ' + err);
                    }
                );
            /**
             * @event ItemList_show
             * Show every ItemsList except Attachments
             */
            $('.ItemsList:not(#Attachments)').show();
        } else {
            var OldRID = GetUrlKeyValue('RID');
            getListItemsByKey('Petty Cash Voucher', 'Request_x0020_ID', OldRID, ['Request_x0020_Date', 'BG', 'Company_x0020_Code', 'Claim_x0020_Type', 'Pay_x0020_To', 'Cost_x0020_Center', 'Order_x0020_Number', 'Employee_x0020_Number', 'Total_x0020_Amount', 'Currency'])
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
                    });
                    $("input[id^='Status_']").val('Rework');
                    $("input[title^='Request Date']").val(currentItem[0]);
                    $("input[title^='BG']").val(currentItem[1]);
                    $("input[title^='Company Code']").val(currentItem[2]);
                    $("select[title^='Claim Type']").val(currentItem[3]);
                    if (currentItem[3] === 'Project') {
                        $("span[data-displayname='Cost Center']").hide();
                        $("span[data-displayname='Order Number']").show();
                        $(".changeLabel b").text('Order Number:');
                        $("input[title^='Cost Center']").val('');
                    } else {
                        $("span[data-displayname='Cost Center']").show();
                        $("span[data-displayname='Order Number']").hide();
                        $(".changeLabel b").text('Cost Center:');
                        $("input[title^='Order Number']").val('');
                    }
                    $("input[title^='Cost Center']").val(currentItem[5]);
                    $("input[title^='Order Number']").val(currentItem[6]);
                    $("input[title^='Employee Number']").val(currentItem[7]);
                    $("input[title^='Total Amount']").val(currentItem[8]);
                    $("input[title^='Currency']").val(currentItem[9]);
                    $("#TPrice").text(currentItem[8]);
                    
                    getListItemsByKey('Currency List', 'ID', 1, ['Auto_x0020_Number'])
                    .then(
                        function (data) {
                            autoNumber = data[0][0];
                            createRID('PCV-', 'autoNumber')
                            .then(
                                function (data) {
                                    RIDText = data;
                                    $("input[title^='Request ID']").val(RIDText);
                                    //Structure of items list
                                    $('.RID').val(RIDText);
                                    updateListItem('Currency List', [{
                                        'ID': 1,
                                        'Auto_x0020_Number': autoNumber + 1
                                    }])
                                    .then(
                                        function (data) {
                                            getListItemsByKey('Currency List', 'ID', '', ['Title', 'Company_x0020_Code', 'Full_x0020_Name', 'Currency', 'Vendor_x0020_Prefix', 'Approver'])
                                            .then(
                                                function (data) {
                                                    currencyList = data;
                                                    for (var i in currencyList) {
                                                        $('#BG_Replace_Field_DropDownChoice').append('<option value="' + currencyList[i][0] + '">' + currencyList[i][0] + ' - ' + currencyList[i][2] + '</option>');
                                                        if (currencyList[i][0] === currentItem[1]) {
                                                            bgIndex = i;
                                                        }
                                                    }
                                                    $('#BG_Replace_Field_DropDownChoice').val($("input[title^='BG']").val());
                                                    getListItemsByKey('Amount List', 'Title', OldRID, ['Account', 'Account_Type', 'Description', 'Invoice_Number', 'Amount', 'Currency', 'Left'])
                                                    .then(
                                                        function (data) {
                                                            for (var i in data) {
                                                                var d3 = data[i][3] === null ? '' : data[i][3];
                                                                var d6 = data[i][6] === null ? '' : data[i][6];
                                                                $('#AmountList .selectable').append('<tr class="ui-widget-content new"><td>' + RIDText + '</td><td class="hidden">' + data[i][0] + '</td><td>' + data[i][1] + '</td><td>' + data[i][2] + '</td><td>' + d3 + '</td><td>' + data[i][4] + '</td><td>' + data[i][5] + '</td><td class="hidden">' + d6 + '</td></tr>');
                                                            }
                                                            getListItemsByKey('Approver List', 'Title', OldRID, ['Approval_x0020_Level', 'Approver_x0020_Account', 'Approver_x0020_Name'])
                                                            .then(
                                                                function (data) {
                                                                    for (var i in data) {
                                                                        $('#ApproverList .selectable').append('<tr class="ui-widget-content new"><td>' + RIDText + '</td><td>' + data[i][0] + '</td><td class="hidden">' + data[i][1] + '</td><td>' + data[i][2] + '</td></tr>');
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
                                                                    if ($('#ApproverPicker').length > 0) {
                                                                        initializePeoplePicker('ApproverPicker')
                                                                            .then(
                                                                                function () {
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
                                                                     * @event attachUserFieldFunction_PayTo
                                                                        * Attach the automatically get specific user information function to 'Pay To' people picker, see details: {@link attachUserFieldFunction}
                                                                        * @since FormActions 1.2 beta
                                                                        */
                                                                    attachUserFieldFunction('Pay To', ['Cost Center', 'Employee Number', 'Vendor'], ['Costcenter', 'EmployeeNumber', 'WebSite']);
                                                                    var loadPayTo = currentItem[4].get_email();
                                                                    setUserFieldValue('Pay To', loadPayTo);
                                                                    /**
                                                                     * @event WaitingDialog_close
                                                                        * Close the WaitingDialog after all events executed successfully.
                                                                        */
                                                                    WaitingDialog.close();
                                                                    $('#BG_Replace_Field_DropDownChoice').change();
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
                        }
                    );
                },
                function (err) {
                    console.log('Error: ' + err);
                }
            );
            /**
             * @event ItemList_show
             * Show every ItemsList except Attachments
             */
            $('.ItemsList:not(#Attachments)').show();
        }


    } else if ($("span[data-displayname='Request ID']").children().length != 0 && $("input[title^='Request ID']").val() != '') {

        //Setup readonly fields
        $("input[id^='Title']").css('width', '550');
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

        getListItemsByKey('Currency List', 'ID', '', ['Title', 'Company_x0020_Code', 'Full_x0020_Name', 'Currency', 'Vendor_x0020_Prefix'])
            .then(
                function (data) {
                    currencyList = data;
                    for (var i in currencyList) {
                        $('#BG_Replace_Field_DropDownChoice').append('<option value="' + currencyList[i][0] + '">' + currencyList[i][0] + ' - ' + currencyList[i][2] + '</option>');
                    }
                    $('#BG_Replace_Field_DropDownChoice').val($("input[title^='BG']").val());
                    getListItemsByKey('Amount List', 'Title', RIDText, ['Account', 'Account_Type', 'Description', 'Invoice_Number', 'Amount', 'Currency', 'Left'])
                        .then(
                            function (data) {
                                for (var i in data) {
                                    var d3 = data[i][3] === null ? '' : data[i][3];
                                    var d6 = data[i][6] === null ? '' : data[i][6];
                                    $('#AmountList .selectable').append('<tr><td>' + RIDText + '</td><td>' + data[i][0] + '</td><td>' + data[i][1] + '</td><td>' + data[i][2] + '</td><td>' + d3 + '</td><td>' + data[i][4] + '</td><td>' + data[i][5] + '</td><td>' + d6 + '</td></tr>');
                                }
                                getListItemsByKey('Approver List', 'Title', RIDText, ['Approval_x0020_Level', 'Approver_x0020_Account', 'Approver_x0020_Name'])
                                    .then(
                                        function (data) {
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
                                            if ($('#ApproverPicker').length > 0) {
                                                initializePeoplePicker('ApproverPicker')
                                                    .then(
                                                        function () {
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
                                             * @event attachUserFieldFunction_PayTo
                                             * Attach the automatically get specific user information function to 'Pay To' people picker, see details: {@link attachUserFieldFunction}
                                             * @since FormActions 1.2 beta
                                             */
                                            attachUserFieldFunction('Pay To', ['Cost Center', 'Employee Number', 'Vendor'], ['Costcenter', 'EmployeeNumber', 'WebSite']);
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
            var jumpURL = 'https://ledvance365.sharepoint.com/sites/PCVAsia/Lists/Petty%20Cash%20Voucher/NewForm.aspx?RID=' + RIDText;
            $("input[id$='diidIOGoBack']").parent().append("<input type='button' value='Correct' id='Correct' onclick=\"STSNavigate(\'" + jumpURL + "\');\">");
        }

        getListItemsByKey('Amount List', 'Title', RIDText, ['Account', 'Account_Type', 'Description', 'Invoice_Number', 'Amount', 'Currency', 'Left'])
            .then(
                function (data) {
                    for (var i in data) {
                        var d3 = data[i][3] === null ? '' : data[i][3];
                        $('#AmountList .selectable').append('<tr><td>' + RIDText + '</td><td>' + data[i][0] + '</td><td>' + data[i][1] + '</td><td>' + data[i][2] + '</td><td>' + d3 + '</td><td>' + data[i][4] + '</td><td>' + data[i][5] + '</td><td class="hidden">' + data[i][6] + '</td></tr>');
                    }
                    getListItemsByKey('Approver List', 'Title', RIDText, ['Approval_x0020_Level', 'Approver_x0020_Account', 'Approver_x0020_Name'])
                        .then(
                            function (data) {
                                for (var i in data) {
                                    $('#ApproverList .selectable').append('<tr><td>' + RIDText + '</td><td>' + data[i][0] + '</td><td class="hidden">' + data[i][1] + '</td><td>' + data[i][2] + '</td></tr>');
                                }
                                getListItemsByKey('Workflow History', 'Title', RIDText, ['Action_x0020_Time', 'Role', 'Action_x0020_Person', 'Response', 'Comments'])
                                    .then(
                                        function (data) {
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
    if ($('#AmountList .selectable tr').length === 1) {
        formStatus = 'No Amount Item.';
    } else if ($('#AmountList .selectable tr:eq(1) td:eq(1)').text() !== '66230030' && $('#ApproverList .selectable tr').length === 1) {
        formStatus = 'No approver inserted.';
    } else if (incomplete === true) {
        formStatus = 'At least one of required field incomplete.';
    } else {
        formStatus = 'pass';
    }
    console.log('Current form status: ' + formStatus);

    if (formStatus === 'pass') {
        //Confirm to save the request
        var saveConfirm = confirm('Please confirm to submit the request.');
        if (saveConfirm === true) {
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
            if ($("input[id^='Status_']").val() === 'Draft') {
                $("input[id^='Status_']").val('Submitted');
                $('#ctl00_exitfullscreenmodeBtn').click();
                formSaveFunction();
            } else if ($("input[id^='Status_']").val() === 'Rework') {
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
 * @method formSaveFunction
 * ###This is the key function to replace original PreSaveAction function, allow async function running inside
 * ###Several suggestions:
 *     - Organize all the saving/deleting functions in here
 *     - Remember to record save button original function in init function
 *
 * @since FormActions 1.4 beta
 */
function formSaveFunction() {
    //Define vars will use
    var actionCase = [];
    var functionCase = [];
    //Get amount list and approver list column names, then push into arrays
    $('#AmountList .selectable th').each(function () {
        amountColName.push($(this).attr('title'));
    });
    $('#ApproverList .selectable th').each(function () {
        approverColName.push($(this).attr('title'));
    });

    //Get new amount list item content, then push into newAmountItemContents
    for (var i = 0; i < $('#AmountList .selectable tr').length; i++) {
        var amountGetItem = $('#AmountList .selectable tr:eq(' + i + ').new');
        var amountGetItems = [];
        var newAmountGetItems = {};
        amountGetItem.find('td').each(function () {
            amountGetItems.push($(this).text());
        });
        if (amountGetItems.length > 0) {
            for (var x = 0; x < amountColName.length; x++) {
                newAmountGetItems[amountColName[x]] = amountGetItems[x];
            }
            newAmountItemContents.push(newAmountGetItems);
        }
        console.log(newAmountItemContents);
    }
    //Get new approver list item content, then push into newApproverItemContents
    for (var i = 0; i < $('#ApproverList .selectable tr').length; i++) {
        var approverGetItem = $('#ApproverList .selectable tr:eq(' + i + ').new');
        var approverGetItems = [];
        var newApproverGetItems = {};
        approverGetItem.find('td').each(function () {
            approverGetItems.push($(this).text());
        });
        if (approverGetItems.length > 0) {
            for (var x = 0; x < approverColName.length; x++) {
                newApproverGetItems[approverColName[x]] = approverGetItems[x];
            }
            newApproverItemContents.push(newApproverGetItems);
        }
        console.log(newApproverItemContents);
    }

    //Get updated amount list item content, then push into updateItemContents
    /* Stop to use this anymore from v1.5
    for (var i = 0; i < $('#AmountList .selectable tr').length; i++) {
        var updateGetItem = $('#AmountList .selectable tr:eq(' + i + ').updated');
        var updateTemp = [];
        var updateGetItems = {};
        updateGetItem.find('td').each(function () {
            updateTemp.push($(this).text());
        });
        if (updateTemp.length > 0) {
            for (var x = 0; x < amountColName.length; x++) {
                updateGetItems[amountColName[x]] = updateTemp[x];
            }
            updateItemContents.push(updateGetItems);
        }
    }*/
    //Confirm each array status and push the result into array actionCase
    if (newAmountItemContents.length > 0) {
        actionCase.push({
            'valid': '1',
            'function': 'createListItem("Amount List", newAmountItemContents)'
        });
    } else {
        actionCase.push({
            'valid': '0'
        });
    }
    if (newApproverItemContents.length > 0) {
        actionCase.push({
            'valid': '1',
            'function': 'createListItem("Approver List", newApproverItemContents)'
        });
    } else {
        actionCase.push({
            'valid': '0'
        });
    }
    if (updateItemContents.length > 0) {
        actionCase.push({
            'valid': '1',
            'function': 'updateListItem("Amount List", updateItemContents)'
        });
    } else {
        actionCase.push({
            'valid': '0'
        });
    }
    if (itemListIDs.length > 0) {
        actionCase.push({
            'valid': '1',
            'function': 'deleteListItem("Amount List", itemListIDs)'
        });
    } else {
        actionCase.push({
            'valid': '0'
        });
    }
    if (approverListIDs.length > 0) {
        actionCase.push({
            'valid': '1',
            'function': 'deleteListItem("Approver List", approverListIDs)'
        });
    } else {
        actionCase.push({
            'valid': '0'
        });
    }
    for (var i in actionCase) {
        if (actionCase[i].valid === '1') {
            var tempFunction = new Function(actionCase[i].function);
            functionCase.push(tempFunction);
        }
    }
    if (functionCase.length > 0) {
        $.when(
            $.each(functionCase, function (index, value) {
                value.call();
            })
        ).then(
            function (result) {
                console.log(result);
                originalSaveButtonClickHandler();
            },
            function (err) {
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
 * @param  {Function} callback  >Callback function after RID generation
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
    if (type === 'time') {
        RID = appPrefix + now.format('YYMMDDHHmmss');
        //Setup for type "autoNumber"
    } else if (type === 'autoNumber') {
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
 * @param  {Function} callback       >The callback function
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
            if (userProperty == returnProperty) {
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
    _PeoplePickerObject.OnUserResolvedClientScript = function () {

        var attachAccount;
        if (this.TopLevelElementId.slice(-7) === 'TopSpan') {
            var originDiv = $('#' + this.TopLevelElementId.replace('_TopSpan', ''));
        }
        var users = this.GetAllUserInfo();
        if (users.length !== 0) {
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                for (var userProperty in user) {
                    if (userProperty === 'Key') {
                        attachAccount = user[userProperty];
                        var attachUser = new Osram.UserInfo();
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
            if (inputFields.length !== 0 && keyValues.length !== 0 && keyValues.length === inputFields.length) {
                for (var i in inputFields) {
                    $("input[title^='" + inputFields[i] + "']").val(attachUser._userProfileProperties[keyValues[i]]);
                }
                if (this.TopLevelElementId.slice(-7) === 'TopSpan' && originDiv.attr('style') !== '') {
                    originDiv.attr('style', '');
                    originDiv.parent().find('.ms-formvalidation').remove();
                    originDiv.next().blur();
                }
            } else {
                console.log('Error!');
            }
        } else if (users.length === 0 && this.TopLevelElementId.slice(-7) === 'TopSpan') {
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
 * @param  {Function} callback    >The callback function
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
        function () {
            dfd.resolve();
        },
        function (sender, args) {
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
 * @param  {Function} callback    >The callback function
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
        function () {
            dfd.resolve();
        },
        function (sender, args) {
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
 * @param  {Function} callback  >The callback function
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
        function () {
            dfd.resolve();
        },
        function (sender, args) {
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
 * @param  {Function} callback    >The callback function once query succeeded
 * @return {Object} collListItem is the return data, requires onQuerySucceeded function handel first
 *
 * @since FormActions 1.0 beta
 *
 * #See the example:
 *     getListItemsByKey('list', 'ID', 1, ['Title', 'Column'], function(){
 *         doSomething;
 *     });
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
    clientContext.executeQueryAsync( //onQuerySucceeded, onQueryFailed);
        function () {
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
            dfd.resolve(listItemInfos);
        },
        function (sender, args) {
            dfd.reject(args);
        }
    );
    return dfd.promise();
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
    for (i = 1; i <= calcRows; i++) {
        numberList.push(numeral($('#' + itemList + ' tr:eq(' + i + ') td:eq(' + calcIndex + ')').text()).value());
    }

    //Calculate the Max and Sum result and return
    numberList.sort(function (a, b) {
        return a - b;
    });
    var maxResult = numberList[numberList.length - 1];
    var sumResult = numberList.reduce(function (x, y) {
        return x + y;
    });
    return [numeral(maxResult).format('0,0.00'), numeral(sumResult).format('0,0.00')];
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