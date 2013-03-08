from ckan.plugins import implements, SingletonPlugin, IRoutes, IConfigurer, toolkit, IAuthFunctions, ITemplateHelpers
from ckanext.ngds.ngdsui.authorize import (manage_users,publish_dataset)
from ckan.lib.base import (model,abort, h, g, c)
from ckan.logic import get_action,check_access
from ckanext.ngds.ngdsui.misc import helpers
import sys

try:
    from collections import OrderedDict # 2.7
except ImportError:
    from sqlalchemy.util import OrderedDict

class NgdsuiPlugin(SingletonPlugin):


	def customize_ckan_for_ngds(self):
		def _trans_role_datasteward():
			return ('Data Steward')
		def _trans_role_datasubmitter():
			return ('Data Submitter')			

		"""
		Load ckan's authorization module and update the default role with NGDS specific roles. 	
		"""
		module_obj = sys.modules['ckan.new_authz']

		#Create this new module methods for new roles. 'admin' and 'member' already exists in the default roles.
		setattr(module_obj, '_trans_role_datasteward', _trans_role_datasteward)		
		setattr(module_obj, '_trans_role_datasubmitter', _trans_role_datasubmitter)

		from ckan import new_authz 	

		# Remove the existing roles
		#del new_authz.ROLE_PERMISSIONS
		# new_authz.ROLE_PERMISSIONS

		# Initialise NGDS roles.
		new_authz.ROLE_PERMISSIONS=OrderedDict([
				('admin', ['admin']),
				('datasteward', ['read', 'delete_dataset', 'create_dataset', 'update_dataset','publish_dataset']),
				('datasubmitter', ['read', 'create_dataset','update_dataset']),
				('member', ['read']),
		])


	def create_default_group(self,data_dict=None):
		group = model.Group.get('public')

		print group

		if group:
			print "success "
		else:
			print "fail"

		# data_dict['name'] = 'default'
		# data_dict['type'] = 'organization'
		# context= {}
		# data_dict['users'] = [{'name': 'admin', 'capacity': 'admin'}]
		# get_action('group_create')(context, data_dict)

	implements(IRoutes,inherit=True)
	implements(IConfigurer,inherit=True)

	def before_map(self,map):
		"""
		For the moment, set up routes under the sub-root /ngds to render the UI.
		"""
		home_controller = "ckanext.ngds.ngdsui.controllers.home:HomeController"
		map.connect("home","/ngds",controller=home_controller,action="render_index",conditions={"method":["GET"]})
		map.connect("about","/ngds/about",controller=home_controller,action="render_about",conditions={"method":["GET"]})


		contribute_controller = "ckanext.ngds.ngdsui.controllers.contribute:ContributeController"
		map.connect("contribute","/ngds/contribute",controller=contribute_controller,action="index")
		map.connect("harvest","/ngds/harvest",controller=contribute_controller,action="harvest")
		map.connect("harvest_new","/ngds/harvest/{action}",controller=contribute_controller)
		# map.connect("upload","/ngds/contribute/upload",controller=contribute_controller,action="upload")
		map.redirect('/ngds/contribute/dataset/{action}', '/dataset/{action}')
		#map.connect("harvest_new","/ngds/harvest/edit",controller="ckanext.ngds.ngdsui.controllers.contribute:ContributeController",action="edit")

		map.connect("harvest","/ngds/harvest/{id}/{action}",controller=contribute_controller)

		#Map related paths
		map.connect("map","/ngds/map",controller=home_controller,action="render_map",conditions={"method":["GET"]})
		map.connect("library","/ngds/library",controller=home_controller,action="render_library",conditions={"method":["GET"]})
		map.connect("resources","/ngds/resources",controller=home_controller,action="render_resources",conditions={"method":["GET"]})
		map.redirect("search","/ngds/library/search","/dataset", highlight_actions='index search')

		user_controller = "ckanext.ngds.ngdsui.controllers.user:UserController"

		map.connect("manage_users","/ngds/users",controller=user_controller,action="manage_users")
		map.connect("member_new","/ngds/member_new",controller=user_controller,action="member_new")

		return map

	def update_config(self,config):
		"""
		Register the templates directory with ckan so that Jinja can find them.
		"""
		toolkit.add_template_directory(config,'templates')
		#Static files are to be served up from here. Otherwise, pylons will try and decode content in here and will fail.
		toolkit.add_public_directory(config,'public')

		self.customize_ckan_for_ngds()


	implements(IAuthFunctions, inherit=True)

	def get_auth_functions(self):
		return {
			'manage_users': manage_users,
			'publish_dataset': publish_dataset,
		}	

	implements(ITemplateHelpers,inherit=True)
	def get_helpers(self):
		return {
			'get_responsible_party_name':helpers.get_responsible_party_name,
			'get_login_url':helpers.get_login_url
		}	