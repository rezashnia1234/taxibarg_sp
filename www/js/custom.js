var client_version = 0.9;
/*// setTimeout(function(){
	if(navigator.connection.type)
		networkState = navigator.connection.type;
	else
		networkState = navigator.connection.effectiveType;

	if(!window.cordova)
	{
		Connection = {};
		Connection.NONE = "0000";
		// Connection.NONE = "4g";
		setTimeout(function(){
			if(window.localStorage.getItem("udid")==null)
				window.localStorage.setItem("udid","test");
		}, 1500);
		setTimeout(function(){
			if(window.localStorage.getItem("notification_id")==null)
				window.localStorage.setItem("notification_id","test");
		}, 1500);
		device = {};
		device.platform = "iOS";
		//document.querySelector('#myNavigator').pushPage('zaer_service_I_Lost_Something.html', {animation: "none"});
	}
// }, 500);*/


$( document ).ready(function(){





});


function check_net_home_page()
{
	// sessionStorage
	if(check_net(true,false))
	{
		if(window.localStorage.getItem("is_login")==null)
		{
			myApp.popup(".login-screen", true, true);
			convert_persian_digit_to_english();
		}
		else
			login_and_get_data();
	}
}

function check_mobile_number()
{
	if(!check_net(true,false))
		return false;

	var mobile_number = $$('#login_page_mobile').val();


	var mobile_RegExp =  /(\0)?9\d{9}/ ;
	// !jQuery.isNumeric(mobile_number))
	if(mobile_number=="" || !mobile_RegExp.test(mobile_number))
		myApp.alert('لطفا شماره موبایل را با دقت وارد نمایید','توجه', function () {});
	else
	{
		myApp.showIndicator();
		$.ajax({
				url: server_url+'authwithphonenumber',
				type: "POST",
				data: JSON.stringify({ "phone_number":mobile_number }),
				success : function(text)
				{
					myApp.hideIndicator();
					if(text.success == true)
					{
						myApp.popup(".login-screen-verify-number", true, true);
						window.localStorage.setItem("driver_phone_number",mobile_number);
					}


					else
						myApp.alert(text.data,'توجه', function () {});
				},
				error: function(jqXHR, exception) {
					myApp.hideIndicator();
					myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
				},
		});
	}
}

function check_verify_number()
{
	if(!check_net(true,false))
		return false;

	var verify_code = $$('#mobile_verify_code').val();
	if(verify_code=="" || !jQuery.isNumeric(verify_code) || verify_code.length!=5)
		myApp.alert('لطفا کد فعال سازی را با دقت وارد نمایید','توجه', function () {});
	else
	{
		myApp.showIndicator();
		// myApp.showPreloader('در حال اتصال به سرور');
		$.ajax({
				url: server_url+'confirmphone',
				type: "POST",
				data: JSON.stringify
				({
					"phone_number":window.localStorage.getItem("driver_phone_number"),
					"security_code":verify_code,
					"os": device.platform,
					"notification_id": window.localStorage.getItem("notification_id"),
					"device_id":window.localStorage.getItem("udid")
				}),
				//async: true,
				success : function(text)
				{
					myApp.hideIndicator();
					if(text.success == true)
					{
						window.localStorage.setItem("is_login",1);
						window.localStorage.setItem("auth_token",text.data.auth_token);
						myApp.closeModal(".login-screen", false);
						myApp.closeModal(".login-screen-verify-number", true);
						login_and_get_data();
					}
					else
						myApp.alert(text.data,'توجه', function () {});
				},
				error: function(jqXHR, exception) {
					myApp.hideIndicator();
					myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
				},
		});
	}
}

function payment_submit_add()
{
	if(!check_net(true,false))
		return false;

	var price		= $$('#payment_submit_price').val();
	var rahgiri		= $$('#payment_submit_rahgiri').val();
	var description	= $$('#payment_submit_description').val();

	if(price=="" || !jQuery.isNumeric(price))
		myApp.alert('لطفا مبلغ را با دقت وارد نمایید','توجه', function () {});
	else if(rahgiri=="" || !jQuery.isNumeric(rahgiri))
		myApp.alert('لطفاکدرهگیری واریز را با دقت وارد نمایید','توجه', function () {});
	else
	{
		myApp.showIndicator();
		// myApp.showPreloader('در حال اتصال به سرور');
		$.ajax({
				url: server_url+'submitpayment',
				type: "POST",
				data: JSON.stringify
				({
					"value":price,
					"tracking_number":rahgiri,
					"description":description,
					'access-token': window.sessionStorage.getItem('access_token')
				}),
				//async: true,
				success : function(text)
				{
					myApp.hideIndicator();
					if(text.success == true)
					{
						myApp.closeModal('.payment_submit', true);
						myApp.alert('اطلاعات شما با موفقیت ذخیره شد.','توجه', function () {});
						//reload page or update list...
					}
					else
						myApp.alert(text.data,'توجه', function () {});
				},
				error: function(jqXHR, exception) {
					myApp.hideIndicator();
					myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
				},
		});
	}
}

function check_net(show_alert,do_loop)
{
	// console.log(networkState);
	if (networkState == Connection.NONE) {
		if(show_alert)
		{
			if(do_loop)
				window.sessionStorage.setItem("do_loop","1");
			else
				window.sessionStorage.setItem("do_loop","0");

			myApp.alert('شما برای استفاده از این برنامه نیاز به اینترنت دارید','توجه', function () {
				if(window.sessionStorage.getItem("do_loop")=="1")
				{
					window.sessionStorage.removeItem("do_loop");
					check_net(true,true);
				}
			});
		}
		return false;
	}
	return true;
}

function resend_verify_number()
{
	$$('#login_page_mobile').val("");
	myApp.closeModal(".login-screen-verify-number", true);
}

function init_virtual_list_of_invoices()
{
	myApp.showIndicator();
	$.ajax({
			url: server_url+'getinvoicehistory',
			type: "POST",
			data: JSON.stringify
			({
				'access-token': window.sessionStorage.getItem('access_token')
			}),
			//async: true,
			success : function(text)
			{
				console.log(text);
				myApp.hideIndicator();
				if(text.success == true)
				{
					var arr = text.data;
					var data = [];
					for(var i=0;i<arr.length;i++)
					{
						var d = new Date(arr[i].time);
						var d2 = new persianDate(d);
						var date = d2.format('MMMM') + ' ' + d2.format('DD');
						var time = d2.format('HH') + ':' + d2.format('mm');
						var state = 0;
						var dstate = arr[i]['state'];
						data.push
						({
							title: arr[i].driver_name,
							status: arr[i].state,
							id: arr[i].id,
							date: date,
							time: time,
							price: arr[i].value
						});
					}
					myApp.virtualList('#tab4 .list-block.virtual-list',
			 	 	{
				 		items:data,
				 		// Template 7 template to render each item
						template: '<li class="item-content s{{status}}">' +
										'<div class="item-id">{{id}}</div>' +
										'<div class="item-title">{{title}}</div>' +
										'<div class="item-price s{{status}}">{{price}} ریال</div>' +
										'<div class="item-date">{{date}}</div>' +
										'<div class="item-time">{{time}}</div>' +
									'</li>',
						searchAll: function (query, items) {
							var foundItems = [];
							for (var i = 0; i < items.length; i++) {
								// Check if title contains query string
								if (items[i].title.indexOf(query.trim()) >= 0) foundItems.push(i);
							}
							// Return array with indexes of matched items
							return foundItems;
						},
			 		});

				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});
}

function init_virtual_list_of_notifications()
{
	myApp.showIndicator();
	$.ajax({
			url: server_url+'getnotifications',
			type: "POST",
			data: JSON.stringify
			({
				'access-token': window.sessionStorage.getItem('access_token')
			}),
			//async: true,
			success : function(text)
			{
				console.log(text);
				myApp.hideIndicator();
				if(text.success == true)
				{
					var arr = text.data;
					var data = [];
					for(var i=0;i<arr.length;i++)
					{
						console.log("adawdwadawdawd",arr[i]);
						var d = new Date(arr[i].created_at);
						var d2 = new persianDate(d);
						var date = d2.format('MMMM') + ' ' + d2.format('DD');
						var time = d2.format('HH') + ':' + d2.format('mm');
						data.push
						({
							text: arr[i].message,
							status: (arr[i].type=='private')?'0':'1',
							date: date,
							time: time,
						});
					}
					myApp.virtualList('#tab3 .list-block.virtual-list',
			 	 	{
				 		items:data,
				 		// Template 7 template to render each item
				 		template: '<li class="item-content s{{status}}">' +
				 						'<div class="item-status-icon s{{status}}"></div>' +
				 						'<div class="item-text">{{text}}</div>' +
				 						'<div class="item-date">{{date}} - {{time}}</div>' +
				 					'</li>'
			 		});
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});

}
function add_to_clipboard_alert()
{
	myApp.alert('شماره شبا به حافظه دستگاه شما منتقل شد.','توجه', function () {});
}
function init_virtual_list_of_payments()
{
    myApp.showIndicator();
		function numberWithCommas(x)
		{
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
    setTimeout(function () {
        myApp.hideIndicator();
    },500);

	var data = JSON.parse(window.localStorage.getItem('app_data'));
	var to_pay = numberWithCommas(data.to_pay);
	$$("#payment_info_placeholder").html('<div id="payment_info"  onclick="cordova.plugins.clipboard.copy(\'IR120550180280003280150001\',function(){myApp.alert(\'شماره شبا به حافظه دستگاه شما منتقل شد.\',\'توجه\', function () {});});"><div class="paymentable green_text"><div class="paymentable_title"><i class="fa fa-check" aria-hidden="true"></i>  قابل پرداخت</div><div class="paymentable_value">'+to_pay+' ریال</div></div>' +
							 // '<div class="paymentable"><div class="paymentable_title"><i class="fa fa-money" aria-hidden="true"></i>  موجودی</div><div class="paymentable_value">1،000،000 ریال</div></div>' +
							 '<div class="account_number">شماره شبا : IR120550180280003280150001 <i class="fa fa-clone" aria-hidden="true"></i></div>' +
							 '<div class="account_number">شماره کارت : 6037-9974-0153-5118 <i class="fa fa-clone" aria-hidden="true"></i></div>' +
							 '<div class="account_name">به نام حامد نیک</div>' +  '</div>' +
							'');
	$.ajax({
			url: server_url+'getpaymentshistory',
			type: "POST",
			data: JSON.stringify
			({
				'access-token': window.sessionStorage.getItem('access_token')
			}),
			//async: true,
			success : function(text)
			{
				console.log(text);
				myApp.hideIndicator();
				if(text.success == true)
				{

					var arr = text.data;
					var data = [];
					for(var i=0;i<arr.length;i++)
					{
						var d = new Date(arr[i].timestamp);
						var d2 = new persianDate(d);
						var date = d2.format('MMMM') + ' ' + d2.format('DD');
						data.push
						({
							price: numberWithCommas(arr[i].value),
							status: arr[i].state,
							date: date
						});
					}
					myApp.virtualList('#tab1 .list-block.virtual-list',
					{
						items:data,
						// Template 7 template to render each item
						template: '<li class="item-content s{{status}}">' +
										'<div class="item-price"><i class="fa s{{status}}" aria-hidden="true"></i>  واریز {{price}} ریال <span class="status"> </div>' +
										'<div class="item-date">{{date}}</div>' +
									'</li>',
					});
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});
}

function submit_discount_code()
{
	if(!check_net(true,false))
		return false;

	var price			= $$('.submit_discount_code #price_value').val();
	var discount_code	= $$('.submit_discount_code #discount_code_value').val();

	if(discount_code=="" || !jQuery.isNumeric(discount_code))
		myApp.alert('لطف کد تخفیف را با دقت وارد نمایید','توجه', function () {});
	else if(price=="" || !jQuery.isNumeric(price))
		myApp.alert('لطفا مبلغ را با دقت وارد نمایید','توجه', function () {});
	else
	{
		myApp.showIndicator();
		$.ajax({
				url: server_url+'usediscountcode',
				type: "POST",
				data: JSON.stringify
				({
					"discount_code":discount_code,
					"total_purchase_value":price,
					'access-token': window.sessionStorage.getItem('access_token')
				}),
				//async: true,
				success : function(text)
				{
					myApp.hideIndicator();
					if(text.success == true)
					{
						$$('.submit_discount_code #price_value').val("");
						$$('.submit_discount_code #discount_code_value').val("");
						myApp.alert('اطلاعات شما با موفقیت ذخیره شد.','توجه', function () {});
						//reload page or update list...
					}
					else if(text=="2")
						myApp.alert('کد وارد شده صحیح نمی باشد ، لطفا مجددا تلاش کنید.','توجه', function () {});
						else
							myApp.alert(text.data,'توجه', function () {});
				},
				error: function(jqXHR, exception) {
					myApp.hideIndicator();
					myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
				},
		});
	}
}

function init_list_drivers()
{
	var data = JSON.parse(window.localStorage.getItem('app_data'));
	if(data.price_mode=='free')
		return;
	myApp.showIndicator();
	$.ajax({
			url: server_url+'getinvoicehistory',
			type: "POST",
			data: JSON.stringify
			({
				"state":'generated',
				'access-token': window.sessionStorage.getItem('access_token')
			}),
			//async: true,
			success : function(text)
			{
				console.log(text);
				var appdata = JSON.parse(window.localStorage.getItem('app_data'));
				myApp.hideIndicator();
				if(text.success == true)
				{
					var arr = text.data;
					var data = [];
					var max_id = 0;
					for(var i=0;i<arr.length;i++)
					{
						if(arr[i].id>max_id)
							max_id = arr[i].id;
						var dstate = arr[i]['state'];
						data.push
						({
							title: arr[i].driver_name,
							date: arr[i].time,
							count: arr[i].number_of_persons,
							id: arr[i].id,
						});
					}
					window.localStorage.setItem('max_request_id',max_id);
					myList = myApp.virtualList('.list-block.virtual-list.list_of_check_drivers',
						{
							items:data,
							// Template 7 template to render each item
							template: '<li class="item-content">' +
											'<div class="item-title">{{title}}</div>' +
											'<div class="count" >{{count}} '+ appdata.per_person_mode_unit_name +' {{index}}</div>' +
											'<div class="timer" data-countdown="{{date}}" data-id="{{id}}"></div>' +
											'<div class="row no-gutter">' +
												'<div class="col-20"><a href="#" class="button button-fill color-red" onclick="check_driver_delete(\'{{id}}\',$$(this).parent().parent().parent().index(),this);">رد</a></div>' +
												'<div class="col-60"><a href="#" class="button button-fill color-green" onclick="check_driver_confirm(\'{{id}}\',$$(this).parent().parent().parent().index(),this,\'manual\');">تائید</a></div>' +
												// '<div class="col-20"><a href="#" class="button button-fill color-blue" onclick="check_driver_edit(\'{{id}}\',$$(this).parent().parent().parent().index(),this);">اصلاح</a></div>' +
												'<div class="col-20">' +
														'<a href="#" class="button button-fill color-blue" >اصلاح</a>' +
														'<select id="person_count_{{id}}"class="person_count" name="person_count" class="form-control" placeholder="" onchange="check_driver_edit(\'{{id}}\',$$(this).parent().parent().parent().index(),this);">' +
															'<option value=""></option>' +
															'<option value="1">1</option>' +
															'<option value="2">2</option>' +
															'<option value="3">3</option>' +
															'<option value="4">4</option>' +
															'<option value="5">5</option>' +
														'</select>' +
												'</div>' +
											'</div>' +
										'</li>',
							searchAll: function (query, items) {
								var foundItems = [];
								for (var i = 0; i < items.length; i++) {
									// Check if title contains query string
									if (items[i].title.indexOf(query.trim()) >= 0) foundItems.push(i);
								}
								// Return array with indexes of matched items
								return foundItems;
							},
					});
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});
	setTimeout(function () {
		$('[data-countdown]').each(function() {
			var $this = $(this), finalDate = $$(this).data('countdown');
			$this.countdown(finalDate, function(event) {
				// console.log(event);
				if(event.type=="finish")
				{//
					check_driver_confirm($$(this).data('id'),$$(this).parent().index(),this,'automatic');
					$this.html(event.strftime('%M:%S'));
					// console.log(event);
				}
				else
					$this.html(event.strftime('%M:%S'));
			});
		});
	},1000);

}

function check_driver_delete(check_driver_id,index,obj)
{
	// console.log("check_driver_delete");
	// console.log(check_driver_id);
	// console.log(index);


	myApp.showIndicator();
	$.ajax({
			url: server_url+'acceptarrival',
			type: "POST",
			data: JSON.stringify
			({
				"invoice_id":check_driver_id,
				"accept":false,
				'access-token': window.sessionStorage.getItem('access_token')
			}),
			//async: true,
			success : function(text)
			{
				myApp.hideIndicator();
				if(text.success == true)
				{
					$$(obj).parent().parent().parent().css("overflow","hidden");
					$$(obj).parent().parent().parent().css("min-height","0");
					$$(obj).parent().parent().parent().css("height","0");
					setTimeout(function () {myList.deleteItem(index);},299);
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});
}
function check_driver_confirm(check_driver_id,index,obj,type)
{
	// console.log("check_driver_confirm");
	// console.log(check_driver_id);
	// console.log(index);
	// console.log(type);//تائید دستی یا تائید زمانی
	if(type=="automatic")
	{
		$$(obj).parent().css("overflow","hidden");
		$$(obj).parent().css("min-height","0");
		$$(obj).parent().css("height","0");
		setTimeout(function () {myList.deleteItem($$(obj).parent().index());},299);
	}
	else
	{
		myApp.showIndicator();
		$.ajax({
				url: server_url+'acceptarrival',
				type: "POST",
				data: JSON.stringify
				({
					"invoice_id":check_driver_id,
					"accept":true,
					'access-token': window.sessionStorage.getItem('access_token')
				}),
				//async: true,
				success : function(text)
				{
					myApp.hideIndicator();
					if(text.success == true)
					{
						$$(obj).parent().parent().parent().css("overflow","hidden");
						$$(obj).parent().parent().parent().css("min-height","0");
						$$(obj).parent().parent().parent().css("height","0");
						setTimeout(function () {
							myList.deleteItem($$(obj).parent().parent().parent().index());
						},299);
					}
					else
						myApp.alert(text.data,'توجه', function () {});
				},
				error: function(jqXHR, exception) {
					myApp.hideIndicator();
					myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
				},
		});
	}
}
function check_driver_edit(check_driver_id,index,obj)
{
	var temp_count = $$(obj).val();
	if(temp_count=="")
		return false;

	// console.log("check_driver_edit");
	// console.log(check_driver_id);
	// console.log(index);
	// console.log(temp_count);


	console.log('zxc asd ');
	myApp.showIndicator();
	$.ajax({
			url: server_url+'acceptarrival',
			type: "POST",
			data: JSON.stringify
			({
				"invoice_id":check_driver_id,
				"accept":true,
				"number_of_persons":parseInt($$('#person_count_'+check_driver_id.toString()).val()),
				'access-token': window.sessionStorage.getItem('access_token')
			}),
			//async: true,
			success : function(text)
			{
				myApp.hideIndicator();
				if(text.success == true)
				{
					$$(obj).parent().parent().parent().css("overflow","hidden");
					$$(obj).parent().parent().parent().css("min-height","0");
					$$(obj).parent().parent().parent().css("height","0");
					setTimeout(function () {myList.deleteItem(index);},299);
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});
}


function login_and_get_data()
{
	$.ajax({
			url: server_url+'loginwithauthtoken',
			type: "POST",
			data: JSON.stringify
			({
				"auth_token":window.localStorage.getItem("auth_token"),
				"client_version":client_version,
				"os":device.platform
			}),
			//async: true,
			success : function(text)
			{
				myApp.hideIndicator();
				mainView.router.loadPage('taxi_yar.html');
				if(text.success == true)
				{
					window.sessionStorage.setItem("access_token",text.data.access_token);
					window.localStorage.setItem("app_data",JSON.stringify(text.data));
					mainView.router.loadPage('taxi_yar.html');
					setTimeout(function(){
						if(text.data.price_mode=='free')
						{
							$$('#use_discount_code_form').css('display','block');
							if(text.data.role == 'doorman')
							{
								$$('#use_discount_code_form').css('display','none');
								init_list_per_person_confirmations();
								window.setInterval(function()
								{
									load_new_per_person_confirmations();
								}, 10000);
							}

						}
						else
						{
							$$('#use_discount_code_form').css('display','none');
							init_list_drivers();
							window.setInterval(function()
							{
								load_new_requests();
							}, 10000);
						}
						$$('#sidebar-driver-name').text(text.data.name);
						$$('#sidebar-driver-car').text(text.data.car_type + ' ' + text.data.car_color + ' - ' + text.data.license_plate);
						$$("#sidebar-driver-profile-pic").attr("src",text.data.profile_pic_url);
						$$('#manual_offline_check').prop('checked',true);
						if(text.data.manual_offline_since != null)
						{
							$$('#manual_offline_check').prop('checked',false);
						}

					}, 300);
				}
				else
				{
					if(text.data.message != undefined)
					{
						$$('#force-update-message').text(text.data.message);
						myApp.popup(".force-update-popup", true, true);
						window.sessionStorage.setItem('update_url',text.data.update_url);
					}
					else
					{
						myApp.popup(".login-screen", true, true);
						convert_persian_digit_to_english();
					}
				}
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});



}


function load_new_requests()
{
	$.ajax({
	url: server_url+'getinvoicehistory',
	type: "POST",
	data: JSON.stringify
	({
		"state":'generated',
		"last_id":window.localStorage.getItem('max_request_id'),
		'access-token': window.sessionStorage.getItem('access_token')
	}),
	//async: true,
	success : function(text)
	{
		myApp.hideIndicator();
		var max_id = 0;
		if(text.success == true)
		{
			var arr = text.data;
			var data = [];
			for(var i=0;i<arr.length;i++)
			{
				if(arr[i].id>max_id)
					max_id = arr[i].id;

				var dstate = arr[i]['state'];
				data.push
				({
					title: arr[i].driver_name,
					date: arr[i].time,
					count: arr[i].number_of_persons,
					id: arr[i].id,
				});
			}
			if(max_id>0)
				window.localStorage.setItem('max_request_id',max_id);
			myList.prependItems(data);
		}
	},
	error: function(jqXHR, exception) {
		myApp.hideIndicator();
		myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
	},
});
}
function setOfflie(offline)
{
	$.ajax({
	url: server_url+'setoffline',
	type: "POST",
	data: JSON.stringify
	({
		"is_offline":offline,
		'access-token': window.sessionStorage.getItem('access_token')
	}),
	//async: true,
	success : function(text)
	{
		if(offline)
		{
			myApp.alert('تغییر وضعیت از دو ساعت بعد در سیستم اعمال می شود.','توجه', function () {});
		}
	},
	error: function(jqXHR, exception) {
		myApp.hideIndicator();
		myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
	},
});
}
function send_support_message()
{
	var val = $$("#support_message_text").val();
	myApp.showIndicator();
	$.ajax({
			url: server_url+'send_support_message',
			type: "POST",
			data: JSON.stringify
			({
				'text':val,
				'access-token': window.sessionStorage.getItem('access_token')
			}),
			//async: true,
			success : function(text)
			{
				myApp.hideIndicator();
				if(text.success == true)
				{
					myApp.alert(text.data,'توجه', function () {});
					$$("#support_message_text").val('');
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});
}

function goToUpdate()
{
	window.open(window.sessionStorage.getItem('update_url'),'_system');
}








function init_list_per_person_confirmations()
{
	var data = JSON.parse(window.localStorage.getItem('app_data'));

	myApp.showIndicator();
	$.ajax({
			url: server_url+'getperpersoninvoiceconfirmations',
			type: "POST",
			data: JSON.stringify
			({
				'access-token': window.sessionStorage.getItem('access_token')
			}),
			//async: true,
			success : function(text)
			{
				console.log(text);
				myApp.hideIndicator();
				if(text.success == true)
				{
					var arr = text.data;
					var data = [];
					var max_id = 0;
					for(var i=0;i<arr.length;i++)
					{
						if(arr[i].id>max_id)
							max_id = arr[i].id;
						var dstate = arr[i]['state'];
						data.push
						({
							title: arr[i].driver_name,
							date: arr[i].time,
							count: arr[i].number_of_persons,
							id: arr[i].id,
						});
					}
					window.localStorage.setItem('max_request_id',max_id);
					myList = myApp.virtualList('.list-block.virtual-list.list_of_check_drivers',
						{
							items:data,
							// Template 7 template to render each item
							template: '<li class="item-content">' +
											'<div class="item-title">{{title}}</div>' +
											'<div class="count" >{{count}} نفر {{index}}</div>' +
											'<div class="timer" data-countdown="{{date}}" data-id="{{id}}"></div>' +
											'<div class="row no-gutter">' +
												'<div class="col-20"><a href="#" class="button button-fill color-red" onclick="per_person_confirmation_reject(\'{{id}}\',$$(this).parent().parent().parent().index(),this);">رد</a></div>' +
												'<div class="col-60"><a href="#" class="button button-fill color-green" onclick="per_person_confirmation_accept(\'{{id}}\',$$(this).parent().parent().parent().index(),this,\'manual\');">تائید</a></div>' +
												// '<div class="col-20"><a href="#" class="button button-fill color-blue" onclick="check_driver_edit(\'{{id}}\',$$(this).parent().parent().parent().index(),this);">اصلاح</a></div>' +
												'<div class="col-20">' +
														'<a href="#" class="button button-fill color-blue" >اصلاح</a>' +
														'<select id="person_count_{{id}}"class="person_count" name="person_count" class="form-control" placeholder="" onchange="per_person_confirmation_edit(\'{{id}}\',$$(this).parent().parent().parent().index(),this);">' +
															'<option value=""></option>' +
															'<option value="1">1</option>' +
															'<option value="2">2</option>' +
															'<option value="3">3</option>' +
															'<option value="4">4</option>' +
															'<option value="5">5</option>' +
															'<option value="6">6</option>' +
															'<option value="7">7</option>' +
															'<option value="8">8</option>' +
															'<option value="9">9</option>' +
															'<option value="10">10</option>' +
														'</select>' +
												'</div>' +
											'</div>' +
										'</li>',
							searchAll: function (query, items) {
								var foundItems = [];
								for (var i = 0; i < items.length; i++) {
									// Check if title contains query string
									if (items[i].title.indexOf(query.trim()) >= 0) foundItems.push(i);
								}
								// Return array with indexes of matched items
								return foundItems;
							},
					});
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});
	setTimeout(function () {
		$('[data-countdown]').each(function() {
			var $this = $(this), finalDate = $$(this).data('countdown');
			$this.countdown(finalDate, function(event) {
				// console.log(event);
				if(event.type=="finish")
				{//
					check_driver_confirm($$(this).data('id'),$$(this).parent().index(),this,'automatic');
					$this.html(event.strftime('%M:%S'));
					// console.log(event);
				}
				else
					$this.html(event.strftime('%M:%S'));
			});
		});
	},1000);

}


function load_new_per_person_confirmations()
{
	$.ajax({
	url: server_url+'getperpersoninvoiceconfirmations',
	type: "POST",
	data: JSON.stringify
	({
		"last_id":window.localStorage.getItem('max_request_id'),
		'access-token': window.sessionStorage.getItem('access_token')
	}),
	//async: true,
	success : function(text)
	{
		myApp.hideIndicator();
		var max_id = 0;
		if(text.success == true)
		{
			var arr = text.data;
			var data = [];
			for(var i=0;i<arr.length;i++)
			{
				if(arr[i].id>max_id)
					max_id = arr[i].id;

				var dstate = arr[i]['state'];
				data.push
				({
					title: arr[i].driver_name,
					date: arr[i].time,
					count: arr[i].number_of_persons,
					id: arr[i].id,
				});
			}
			if(max_id>0)
				window.localStorage.setItem('max_request_id',max_id);
			myList.prependItems(data);
		}
	},
	error: function(jqXHR, exception) {
		myApp.hideIndicator();
		myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
	},
});
}



function per_person_confirmation_reject(check_driver_id,index,obj)
{
	// console.log("check_driver_delete");
	// console.log(check_driver_id);
	// console.log(index);


	myApp.showIndicator();
	$.ajax({
			url: server_url+'confirmperperson',
			type: "POST",
			data: JSON.stringify
			({
				"confirmation_id":check_driver_id,
				"accept":false,
				'access-token': window.sessionStorage.getItem('access_token')
			}),
			//async: true,
			success : function(text)
			{
				myApp.hideIndicator();
				if(text.success == true)
				{
					$$(obj).parent().parent().parent().css("overflow","hidden");
					$$(obj).parent().parent().parent().css("min-height","0");
					$$(obj).parent().parent().parent().css("height","0");
					setTimeout(function () {myList.deleteItem(index);},299);
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});
}
function per_person_confirmation_accept(check_driver_id,index,obj,type)
{
	// console.log("check_driver_confirm");
	// console.log(check_driver_id);
	// console.log(index);
	// console.log(type);//تائید دستی یا تائید زمانی
	if(type=="automatic")
	{
		$$(obj).parent().css("overflow","hidden");
		$$(obj).parent().css("min-height","0");
		$$(obj).parent().css("height","0");
		setTimeout(function () {myList.deleteItem($$(obj).parent().index());},299);
	}
	else
	{
		myApp.showIndicator();
		$.ajax({
				url: server_url+'confirmperperson',
				type: "POST",
				data: JSON.stringify
				({
					"confirmation_id":check_driver_id,
					"accept":true,
					'access-token': window.sessionStorage.getItem('access_token')
				}),
				//async: true,
				success : function(text)
				{
					myApp.hideIndicator();
					if(text.success == true)
					{
						$$(obj).parent().parent().parent().css("overflow","hidden");
						$$(obj).parent().parent().parent().css("min-height","0");
						$$(obj).parent().parent().parent().css("height","0");
						setTimeout(function () {
							myList.deleteItem($$(obj).parent().parent().parent().index());
						},299);
					}
					else
						myApp.alert(text.data,'توجه', function () {});
				},
				error: function(jqXHR, exception) {
					myApp.hideIndicator();
					myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
				},
		});
	}
}
function per_person_confirmation_edit(check_driver_id,index,obj)
{
	var temp_count = $$(obj).val();
	if(temp_count=="")
		return false;

	// console.log("check_driver_edit");
	// console.log(check_driver_id);
	// console.log(index);
	// console.log(temp_count);


	console.log('zxc asd ');
	myApp.showIndicator();
	$.ajax({
			url: server_url+'confirmperperson',
			type: "POST",
			data: JSON.stringify
			({
				"confirmation_id":check_driver_id,
				"accept":true,
				"passenger_count":parseInt($$('#person_count_'+check_driver_id.toString()).val()),
				'access-token': window.sessionStorage.getItem('access_token')
			}),
			//async: true,
			success : function(text)
			{
				myApp.hideIndicator();
				if(text.success == true)
				{
					$$(obj).parent().parent().parent().css("overflow","hidden");
					$$(obj).parent().parent().parent().css("min-height","0");
					$$(obj).parent().parent().parent().css("height","0");
					setTimeout(function () {myList.deleteItem(index);},299);
				}
				else
					myApp.alert(text.data,'توجه', function () {});
			},
			error: function(jqXHR, exception) {
				myApp.hideIndicator();
				myApp.alert('در پروسه اتصال به سرور مشکلی به وجود آماده است ، لطفا وضعیت اینترنت را بررسی نمایید.','توجه', function () {});
			},
	});
}
