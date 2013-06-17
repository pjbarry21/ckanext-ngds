var ngds = ngds || ( ngds = { } );

ngds.responsible_party = function() {

	var me = this;

	var responsibilify = function(fields) {
		/*
		*	Fields - rs-fake, rs_name, rs_email.
		*/

		(function sanity_check(fields) {
			var rs_name_not_exists = typeof $(fields['rs_name']) === 'undefined';
			var rs_email_not_exists = typeof $(fields['rs_email']) === 'undefined';
			var rs_fake_not_exists = typeof $(fields['rs_fake']) === 'undefined';

			if(rs_name_not_exists || rs_email_not_exists || rs_fake_not_exists) {
				throw "Failed sanity check";
			}
		})(fields);

		
		me.rs_name = fields['rs_name'];
		me.rs_email = fields['rs_email'];
		me.rs_fake = fields['rs_fake'];
		me.rs = fields['rs'];
		me.rs_slug = "#"+me.rs.replace("#","")+'_slug';
		me.rs_token = me.rs.replace("#","");

		var rs_ac = ngds.autocomplete(me.rs_fake,"/responsible_parties",'q',['name','email'],'name'); 

	    rs_ac.proxy(me.rs_name,"name"); 
	    rs_ac.proxy(me.rs_email,"email");

	    var rs_name = me.rs_name;
	    var rs_email = me.rs_email;

	    rs_ac.proxy(me.rs,function(dict) {
	      $(me.rs).val(JSON.stringify({
	        rs_name:dict.name,
	        rs_email:dict.email
	      }));
	    });  

	    $(me.rs_fake).after($("<span/>",{ 'id':me.rs.replace("#","")+'_slug',class:'ngds-slug' }));

	   setup_blur();
	   setup_edit_rs();
	   append_create_rs_anchor();
	};

	var edit_rs = function()  {
		  $(me.rs_slug).hide();
		  $(me.rs_fake).show();
		  // $(".distributor-edit").remove();
		  me.rs_create_anch.show();
		  return false;
	};

	var setup_blur = function() {
	
		me.rs_blur = function(ev) {
			  if($(me.rs_fake).is(":focus")===true) {
			    return;
			  }

			  if($(me.rs_fake).val()==="") {
			    $(me.rs_name).val("");
			    $(me.rs_email).val("");
			    $(me.rs_slug).html("");
			    $(me.rs_slug).hide();
			    $(me.rs_fake).show();
			  }

			  if(typeof ev!=='undefined' && typeof $(ev.target).attr('class') !=='undefined' && $(ev.target).attr('class').indexOf(me.rs_slug)!==-1) {
			    edit_rs();
			    return;
			  }

			  var rs_name_v = $(me.rs_name).val();
			  var rs_email_v = $(me.rs_email).val();

			  if(rs_name_v !==null && typeof rs_name_v !=='undefined' && rs_name_v !=='' && rs_email_v !==null && rs_email_v !=='' && typeof rs_email_v !=='undefined' && ev.target.className.indexOf(me.rs.replace("#",""))===-1) {
			    $(me.rs_fake).hide();
			    me.rs_create_anch.hide();
			    $(me.rs_slug).show();
			    $(me.rs_slug).html(rs_name_v);
			    $("."+me.rs_token+"_c_form").remove();
			    $(me.rs_slug).attr("title",rs_name_v+", "+rs_email_v);
			  }
			};

		$(document).on('click',me.rs_blur);
		$(document).on('blur',me.rs_fake,me.rs_blur);
	}; 

	var setup_edit_rs = function() {

		$(me.rs_slug).on('click',edit_rs);
	};

	var append_create_rs_anchor = function() {
		var rs_fake = $(me.rs_fake);
		
		 me.rs_create_anch = $("<a/>",{ 
				'text':'Add '+me.rs.replace("#",""),
				'class':'form-anchor '+me.rs.replace("#",""),
				'style':'cursor:pointer;'
			});

		me.rs_create_anch.on('click',function(ev){
			me.rs_create_anch.hide();
			$(me.rs_slug).hide();
			$(me.rs_fake).show();
			var rs_token = me.rs.replace("#","");
			var rs_c_name = rs_token+"_c_name";
			var rs_c_email = rs_token+"_c_email";
			var rs_c_create_button = rs_token+"_c_create_button";
			var rs_c_cancel_button = rs_token+"_c_cancel_button";
			var rs_c_form = rs_token+"_c_form";

			 var responsible_parties = {
			 	'class':rs_c_form,
			    'responsible_parties':[
			      {
			        'label':'Name',				        
			        'type':'text',
			        'name':rs_c_name,
			        'id':rs_c_name,
			        'class':rs_c_form
			      },
			      {
			        'label':'Email',
			        'type':'text',
			        'name':rs_c_name,
			        'id':rs_c_email,
			        'class':rs_c_form
			      },
			      {
			        'button':'Create',
			        'id':rs_c_create_button,
			        'class':rs_c_form
			      },
			       {
			        'button':'Cancel',
			        'id':rs_c_cancel_button,
			        'class':rs_c_form
			      }
			    ]
			  };

			me.rs_create_anch.after(Mustache.render(ngds.add_responsible_party_template,responsible_parties));

			var rs_c_name_jq = $("#"+rs_c_name);
			var rs_c_email_jq = $("#"+rs_c_email);
			var rs_c_create_button_jq = $("#"+rs_c_create_button);
			var rs_c_cancel_button_jq = $("#"+rs_c_cancel_button);
			var rs_c_form_jq = $("."+rs_c_form);		

			rs_c_create_button_jq.on('click',function() {
				 $.ajax({
			        'url':'/api/action/additional_metadata',
			        'type':'POST',
			        'data':JSON.stringify({
			          "process":"create",
			          "model":"ResponsibleParty",
			          "data":{
			            "name":rs_c_name_jq.val(),
			            "email":rs_c_email_jq.val()
			          }
			        }),
			        'success':function(response) {
			          $(me.rs_name).val(response.result.name);
			          $(me.rs_email).val(response.result.email);
			          // $(rs_cre).html("Success");
			          rs_c_form_jq.fadeOut(1500,function() {
			             rs_c_form_jq.remove();

			             $(me.rs_fake).val(response.result.name);
			             me.rs_blur();
			          });
			        }
			  });
			});
			

		});

		rs_fake.after(me.rs_create_anch);
	};

	return {
		'responsibilify':responsibilify
	}	
};