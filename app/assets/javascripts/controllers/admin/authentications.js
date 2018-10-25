/* eslint-disable
    camelcase,
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
'use strict'

/* COMMON CODE */

// # list of supported authentication methods
const METHODS = {
  'DatabaseProvider': 'local_database',
  'OAuth2Provider': 'o_auth2'
}

// #
// Iterate through the provided array and return the index of the requested element
// @param elements {Array<{id:*}>}
// @param id {*} id of the element to retrieve in the list
// @returns {number} index of the requested element, in the provided array
// #
const findIdxById = (elements, id) =>
  (elements.map(elem => elem.id)).indexOf(id)

// #
// For OAuth2 ententications, mapping the user's ID is mendatory. This function will check that this mapping
// is effective and will return false otherwise
// @param mappings {Array<Object>} expected: $scope.provider.providable_attributes.o_auth2_mappings_attributes
// @returns {Boolean} true if the mapping is declared
// #
const check_oauth2_id_is_mapped = function (mappings) {
  for (let mapping of Array.from(mappings)) {
    if ((mapping.local_model === 'user') && (mapping.local_field === 'uid') && !mapping._destroy) {
      return true
    }
  }
  return false
}

// #
// Provides a set of common callback methods and data to the $scope parameter. These methods are used
// in the various authentication providers' controllers.
//
// Provides :
//  - $scope.authMethods
//  - $scope.mappingFields
//  - $scope.cancel()
//  - $scope.defineDataMapping(mapping)
//
// Requires :
//  - mappingFieldsPromise: retrieved by AuthProvider.mapping_fields()
//  - $state (Ui-Router) [ 'app.admin.members' ]
// #
class AuthenticationController {
  constructor ($scope, $state, $uibModal, mappingFieldsPromise) {
    // # list of supported authentication methods
    $scope.authMethods = METHODS

    // # list of fields that can be mapped through the SSO
    $scope.mappingFields = mappingFieldsPromise

    // #
    // Changes the admin's view to the members list page
    // #
    $scope.cancel = () => $state.go('app.admin.members')

    // #
    // Open a modal allowing to specify the data mapping for the given field
    // #
    $scope.defineDataMapping = mapping =>
      $uibModal.open({
        templateUrl: '<%= asset_path "admin/authentications/_data_mapping.html" %>',
        size: 'md',
        resolve: {
          field () { return mapping },
          datatype () {
            for (let field of Array.from($scope.mappingFields[mapping.local_model])) {
              if (field[0] === mapping.local_field) {
                return field[1]
              }
            }
          }
        },

        controller: ['$scope', '$uibModalInstance', 'field', 'datatype', function ($scope, $uibModalInstance, field, datatype) {
          // # parent field
          $scope.field = field
          // # expected data type
          $scope.datatype = datatype
          // # data transformation rules
          $scope.transformation =
            { rules: field.transformation || { type: datatype } }
          // # available transformation formats
          $scope.formats = {
            date: [
              {
                label: 'ISO 8601',
                value: 'iso8601'
              },
              {
                label: 'RFC 2822',
                value: 'rfc2822'
              },
              {
                label: 'RFC 3339',
                value: 'rfc3339'
              },
              {
                label: 'Timestamp (s)',
                value: 'timestamp-s'
              },
              {
                label: 'Timestamp (ms)',
                value: 'timestamp-ms'
              }
            ]
          }

          // # Create a new mapping between anything and an expected integer
          $scope.addIntegerMapping = function () {
            if (!angular.isArray($scope.transformation.rules.mapping)) {
              $scope.transformation.rules.mapping = []
            }
            return $scope.transformation.rules.mapping.push({ from: '', to: 0 })
          }

          // # close and save the modifications
          $scope.ok = () => $uibModalInstance.close($scope.transformation.rules)

          // # do not save the modifications
          return $scope.cancel = () => $uibModalInstance.dismiss()
        }
        ] })
        .result['finally'](null).then(transfo_rules => mapping.transformation = transfo_rules)
  }
}

// #
// Page listing all authentication providers
// #
Application.Controllers.controller('AuthentificationController', ['$scope', '$state', '$rootScope', 'dialogs', 'growl', 'authProvidersPromise', 'AuthProvider', '_t',
  function ($scope, $state, $rootScope, dialogs, growl, authProvidersPromise, AuthProvider, _t) {
  /* PUBLIC SCOPE */

    // # full list of authentication providers
    $scope.providers = authProvidersPromise

    // #
    // Translate the classname into an explicit textual message
    // @param type {string} Ruby polymorphic model classname
    // @returns {string}
    // #
    $scope.getType = function (type) {
      const text = METHODS[type]
      if (typeof text !== 'undefined') {
        return _t(text)
      } else {
        return _t('unknown') + type
      }
    }

    // #
    // Translate the status string into an explicit textual message
    // @param status {string} active | pending | previous
    // @returns {string}
    // #
    $scope.getState = function (status) {
      switch (status) {
        case 'active': return _t('active')
        case 'pending': return _t('pending')
        case 'previous': return _t('previous_provider')
        default: return _t('unknown') + status
      }
    }

    // #
    // Ask for confirmation then delete the specified provider
    // @param providers {Array} full list of authentication providers
    // @param provider {Object} provider to delete
    // #
    return $scope.destroyProvider = (providers, provider) =>
      dialogs.confirm({
        resolve: {
          object () {
            return {
              title: _t('confirmation_required'),
              msg: _t('do_you_really_want_to_delete_the_TYPE_authentication_provider_NAME', { TYPE: $scope.getType(provider.providable_type), NAME: provider.name })
            }
          }
        }
      }
      , () =>
        // the admin has confirmed, delete
        AuthProvider.delete({ id: provider.id }
          , function () {
            providers.splice(findIdxById(providers, provider.id), 1)
            return growl.success(_t('authentication_provider_successfully_deleted'))
          }
          , () => growl.error(_t('an_error_occurred_unable_to_delete_the_specified_provider')))
      )
  }

])

// #
// Page to add a new authentication provider
// #
Application.Controllers.controller('NewAuthenticationController', ['$scope', '$state', '$rootScope', '$uibModal', 'dialogs', 'growl', 'mappingFieldsPromise', 'authProvidersPromise', 'AuthProvider', '_t',
  function ($scope, $state, $rootScope, $uibModal, dialogs, growl, mappingFieldsPromise, authProvidersPromise, AuthProvider, _t) {
    $scope.mode = 'creation'

    // # default parameters for the new authentication provider
    $scope.provider = {
      name: '',
      providable_type: '',
      providable_attributes: {}
    }

    // #
    // Initialize some provider's specific properties when selecting the provider type
    // #
    $scope.updateProvidable = function () {
    // === OAuth2Provider ===
      if ($scope.provider.providable_type === 'OAuth2Provider') {
        if (typeof $scope.provider.providable_attributes.o_auth2_mappings_attributes === 'undefined') {
          return $scope.provider.providable_attributes['o_auth2_mappings_attributes'] = []
        }
      }
    }
    // Add others providers initializers here if needed ...

    // #
    // Validate and save the provider parameters in database
    // #
    $scope.registerProvider = function () {
    // === DatabaseProvider ===
      let provider
      if ($scope.provider.providable_type === 'DatabaseProvider') {
      // prevent from adding mode than 1
        for (provider of Array.from(authProvidersPromise)) {
          if (provider.providable_type === 'DatabaseProvider') {
            growl.error(_t('a_local_database_provider_already_exists_unable_to_create_another'))
            return false
          }
        }
        return AuthProvider.save({ auth_provider: $scope.provider }, function (provider) {
          growl.success(_t('local_provider_successfully_saved'))
          return $state.go('app.admin.members')
        })
        // === OAuth2Provider ===
      } else if ($scope.provider.providable_type === 'OAuth2Provider') {
      // check the ID mapping
        if (!check_oauth2_id_is_mapped($scope.provider.providable_attributes.o_auth2_mappings_attributes)) {
          growl.error(_t('it_is_required_to_set_the_matching_between_User.uid_and_the_API_to_add_this_provider'))
          return false
        }
        // discourage the use of unsecure SSO
        if (!($scope.provider.providable_attributes.base_url.indexOf('https://') > -1)) {
          return dialogs.confirm({
            size: 'l',
            resolve: {
              object () {
                return {
                  title: _t('security_issue_detected'),
                  msg: _t('beware_the_oauth2_authenticatoin_provider_you_are_about_to_add_isnt_using_HTTPS') +
                    _t('this_is_a_serious_security_issue_on_internet_and_should_never_be_used_except_for_testing_purposes') +
                    _t('do_you_really_want_to_continue')
                }
              }
            }
          }
          , () => // unsecured http confirmed
            AuthProvider.save({ auth_provider: $scope.provider }, function (provider) {
              growl.success(_t('unsecured_oauth2_provider_successfully_added'))
              return $state.go('app.admin.members')
            })
          )
        } else {
          return AuthProvider.save({ auth_provider: $scope.provider }, function (provider) {
            growl.success(_t('oauth2_provider_successfully_added'))
            return $state.go('app.admin.members')
          })
        }
      }
    }

    // # Using the AuthenticationController
    return new AuthenticationController($scope, $state, $uibModal, mappingFieldsPromise)
  }
])

// #
// Page to edit an already added authentication provider
// #
Application.Controllers.controller('EditAuthenticationController', ['$scope', '$state', '$stateParams', '$rootScope', '$uibModal', 'dialogs', 'growl', 'providerPromise', 'mappingFieldsPromise', 'AuthProvider', '_t',
  function ($scope, $state, $stateParams, $rootScope, $uibModal, dialogs, growl, providerPromise, mappingFieldsPromise, AuthProvider, _t) {
  // # parameters of the currently edited authentication provider
    $scope.provider = providerPromise

    $scope.mode = 'edition'

    // #
    // Update the current provider with the new inputs
    // #
    $scope.updateProvider = function () {
    // check the ID mapping
      if (!check_oauth2_id_is_mapped($scope.provider.providable_attributes.o_auth2_mappings_attributes)) {
        growl.error(_t('it_is_required_to_set_the_matching_between_User.uid_and_the_API_to_add_this_provider'))
        return false
      }
      return AuthProvider.update({ id: $scope.provider.id }, { auth_provider: $scope.provider }, function (provider) {
        growl.success(_t('provider_successfully_updated'))
        return $state.go('app.admin.members')
      }
      , () => growl.error(_t('an_error_occurred_unable_to_update_the_provider')))
    }

    // # Using the AuthenticationController
    return new AuthenticationController($scope, $state, $uibModal, mappingFieldsPromise)
  }
])
