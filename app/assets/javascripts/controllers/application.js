/* eslint-disable
    handle-callback-err,
    no-return-assign,
    no-undef,
    standard/no-callback-literal,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
'use strict'

Application.Controllers.controller('ApplicationController', ['$rootScope', '$scope', '$window', '$locale', 'Session', 'AuthService', 'Auth', '$uibModal', '$state', 'growl', 'Notification', '$interval', 'Setting', '_t', 'Version',
  function ($rootScope, $scope, $window, $locale, Session, AuthService, Auth, $uibModal, $state, growl, Notification, $interval, Setting, _t, Version) {
  /* PRIVATE STATIC CONSTANTS */

    // User's notifications will get refreshed every 30s
    const NOTIFICATIONS_CHECK_PERIOD = 30000

    /* PUBLIC SCOPE */

    // # Fab-manager's version
    $scope.version =
      { version: '' }

    // # currency symbol for the current locale (cf. angular-i18n)
    $rootScope.currencySymbol = $locale.NUMBER_FORMATS.CURRENCY_SYM

    // #
    // Set the current user to the provided value and initialize the session
    // @param user {Object} Rails/Devise user
    // #
    $scope.setCurrentUser = function (user) {
      if (!angular.isUndefinedOrNull(user)) {
        $rootScope.currentUser = user
        Session.create(user)
        getNotifications()
        // fab-manager's app-version
        if (user.role === 'admin') {
          return $scope.version = Version.get()
        } else {
          return $scope.version = { version: '' }
        }
      }
    }

    // #
    // Login callback
    // @param e {Object} see https://docs.angularjs.org/guide/expression#-event-
    // @param callback {function}
    // #
    $scope.login = function (e, callback) {
      if (e) { e.preventDefault() }
      return openLoginModal(null, null, callback)
    }

    // #
    // Logout callback
    // @param e {Object} see https://docs.angularjs.org/guide/expression#-event-
    // #
    $scope.logout = function (e) {
      e.preventDefault()
      return Auth.logout().then(function (oldUser) {
      // console.log(oldUser.name + " you're signed out now.");
        Session.destroy()
        $rootScope.currentUser = null
        $rootScope.toCheckNotifications = false
        $scope.notifications = {
          total: 0,
          unread: 0
        }
        return $state.go('app.public.home')
      }
      , function (error) {})
    }
    // An error occurred logging out.

    // #
    // Open the modal window allowing the user to create an account.
    // @param e {Object} see https://docs.angularjs.org/guide/expression#-event-
    // #
    $scope.signup = function (e) {
      if (e) { e.preventDefault() }

      return $uibModal.open({
        templateUrl: '<%= asset_path "shared/signupModal.html" %>',
        size: 'md',
        controller: ['$scope', '$uibModalInstance', 'Group', 'CustomAsset', function ($scope, $uibModalInstance, Group, CustomAsset) {
        // default parameters for the date picker in the account creation modal
          $scope.datePicker = {
            format: Fablab.uibDateFormat,
            opened: false,
            options: {
              startingDay: Fablab.weekStartingDay
            }
          }

          // callback to open the date picker (account creation modal)
          $scope.openDatePicker = function ($event) {
            $event.preventDefault()
            $event.stopPropagation()
            return $scope.datePicker.opened = true
          }

          // retrieve the groups (standard, student ...)
          Group.query(groups => $scope.groups = groups)

          // retrieve the CGU
          CustomAsset.get({ name: 'cgu-file' }, cgu => $scope.cgu = cgu.custom_asset)

          // default user's parameters
          $scope.user = {
            is_allow_contact: true,
            is_allow_newsletter: false
          }

          // Errors display
          $scope.alerts = []
          $scope.closeAlert = index => $scope.alerts.splice(index, 1)

          // callback for form validation
          return $scope.ok = function () {
          // try to create the account
            $scope.alerts = []
            // remove 'organization' attribute
            const orga = $scope.user.organization
            delete $scope.user.organization
            // register on server
            return Auth.register($scope.user).then(user =>
            // creation successful
              $uibModalInstance.close(user)

            , function (error) {
            // creation failed...
            // restore organization param
              $scope.user.organization = orga
              // display errors
              return angular.forEach(error.data.errors, (v, k) =>
                angular.forEach(v, err =>
                  $scope.alerts.push({
                    msg: k + ': ' + err,
                    type: 'danger'
                  })
                )
              )
            })
          }
        }
        ] })
        .result['finally'](null).then(user =>
        // when the account was created succesfully, set the session to the newly created account
          $scope.setCurrentUser(user)
        )
    }

    // #
    // Open the modal window allowing the user to change his password.
    // @param token {string} security token for password changing. The user should have recieved it by mail
    // #
    $scope.editPassword = token =>
      $uibModal.open({
        templateUrl: '<%= asset_path "shared/passwordEditModal.html" %>',
        size: 'md',
        controller: ['$scope', '$uibModalInstance', '$http', '_t', function ($scope, $uibModalInstance, $http, _t) {
          $scope.user =
          { reset_password_token: token }
          $scope.alerts = []
          $scope.closeAlert = index => $scope.alerts.splice(index, 1)

          return $scope.changePassword = function () {
            $scope.alerts = []
            return $http.put('/users/password.json', { user: $scope.user }).success(data => $uibModalInstance.close()).error(data =>
              angular.forEach(data.errors, (v, k) =>
                angular.forEach(v, err =>
                  $scope.alerts.push({
                    msg: k + ': ' + err,
                    type: 'danger'
                  })
                )
              )
            )
          }
        }
        ] })
        .result['finally'](null).then(function (user) {
          growl.success(_t('your_password_was_successfully_changed'))
          return Auth.login().then(user => $scope.setCurrentUser(user)
            , function (error) {})
        })

    // Authentication failed...

    // #
    // Compact/Expend the width of the left navigation bar
    // @param e {Object} see https://docs.angularjs.org/guide/expression#-event-
    // #
    $scope.toggleNavSize = function (event) {
      let $classes, $targets
      if (typeof event === 'undefined') {
        console.error('[ApplicationController::toggleNavSize] Missing event parameter')
        return
      }

      let toggler = $(event.target)
      if (!toggler.data('toggle')) { toggler = toggler.closest('[data-toggle^="class"]') }

      const $class = toggler.data()['toggle']
      const $target = toggler.data('target') || toggler.attr('data-link')

      if ($class) {
        const $tmp = $class.split(':')[1]
        if ($tmp) { $classes = $tmp.split(',') }
      }

      if ($target) {
        $targets = $target.split(',')
      }

      if ($classes && $classes.length) {
        $.each($targets, function (index, value) {
          if ($classes[index].indexOf('*') !== -1) {
            const patt = new RegExp('\\s',
              +$classes[index].replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s'),
              +'\\s', 'g')
            $(toggler).each(function (i, it) {
              let cn = ` ${it.className} `
              while (patt.test(cn)) {
                cn = cn.replace(patt, ' ')
              }
              return it.className = $.trim(cn)
            })
          }

          return (($targets[index] !== '#') && $($targets[index]).toggleClass($classes[index])) || toggler.toggleClass($classes[index])
        })
      }

      toggler.toggleClass('active')
    }

    /* PRIVATE SCOPE */
    // #
    // Kind of constructor: these actions will be realized first when the controller is loaded
    // #
    const initialize = function () {
    // try to retrieve any currently logged user
      Auth.login().then(function (user) {
        $scope.setCurrentUser(user)
        // force users to complete their profile if they are not
        if (user.need_completion) {
          return $state.transitionTo('app.logged.profileCompletion')
        }
      }
      , error =>
      // Authentication failed...
        $rootScope.toCheckNotifications = false
      )

      // bind to the $stateChangeStart event (AngularJS/UI-Router)
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (!toState.data) { return }

        const { authorizedRoles } = toState.data
        if (!AuthService.isAuthorized(authorizedRoles)) {
          event.preventDefault()
          if (AuthService.isAuthenticated()) {
          // user is not allowed
            return console.error('[ApplicationController::initialize] user is not allowed')
          } else {
          // user is not logged in
            return openLoginModal(toState, toParams)
          }
        }
      })

      // we stop polling notifications when the page is not in foreground
      onPageVisible(state => $rootScope.toCheckNotifications = (state === 'visible'))

      Setting.get({ name: 'fablab_name' }, data => $scope.fablabName = data.setting.value)
      Setting.get({ name: 'name_genre' }, data => $scope.nameGenre = data.setting.value)

      // shorthands
      $scope.isAuthenticated = Auth.isAuthenticated
      $scope.isAuthorized = AuthService.isAuthorized
      return $rootScope.login = $scope.login
    }

    // #
    // Retreive once the notifications from the server and display a message popup for each new one.
    // Then, periodically check for new notifications.
    // #
    var getNotifications = function () {
      $rootScope.toCheckNotifications = true
      if (!$rootScope.checkNotificationsIsInit && !!$rootScope.currentUser) {
        setTimeout(() =>
        // we request the most recent notifications
          Notification.last_unread(function (notifications) {
            $rootScope.lastCheck = new Date()
            $scope.notifications = notifications.totals

            const toDisplay = []
            angular.forEach(notifications.notifications, n => toDisplay.push(n))

            if (toDisplay.length < notifications.totals.unread) {
              toDisplay.push({ message: { description: _t('and_NUMBER_other_notifications', { NUMBER: notifications.totals.unread - toDisplay.length }, 'messageformat') } })
            }

            return angular.forEach(toDisplay, notification => growl.info(notification.message.description))
          })

        , 2000)

        const checkNotifications = function () {
          if ($rootScope.toCheckNotifications) {
            return Notification.polling({ last_poll: $rootScope.lastCheck }).$promise.then(function (data) {
              $rootScope.lastCheck = new Date()
              $scope.notifications = data.totals

              return angular.forEach(data.notifications, notification => growl.info(notification.message.description))
            })
          }
        }

        $interval(checkNotifications, NOTIFICATIONS_CHECK_PERIOD)
        return $rootScope.checkNotificationsIsInit = true
      }
    }

    // #
    // Open the modal window allowing the user to log in.
    // #
    var openLoginModal = function (toState, toParams, callback) {
      // <% active_provider = AuthProvider.active %>
      // <% if active_provider.providable_type != DatabaseProvider.name %>
      $window.location.href = '<%=user_omniauth_authorize_path(AuthProvider.active.strategy_name.to_sym)%>'
      // <% else %>
      return $uibModal.open({
        templateUrl: '<%= asset_path "shared/deviseModal.html" %>',
        size: 'sm',
        controller: ['$scope', '$uibModalInstance', '_t', function ($scope, $uibModalInstance, _t) {
          const user = ($scope.user = {})
          $scope.login = () =>
            Auth.login(user).then(function (user) {
            // Authentification succeeded ...
              $uibModalInstance.close(user)
              if (callback && (typeof callback === 'function')) {
                return callback(user)
              }
            }
            , function (error) {
            // Authentication failed...
              $scope.alerts = []
              return $scope.alerts.push({
                msg: _t('wrong_email_or_password'),
                type: 'danger'
              })
            })

          // handle modal behaviors. The provided reason will be used to define the following actions
          $scope.dismiss = () => $uibModalInstance.dismiss('cancel')

          $scope.openSignup = function (e) {
            e.preventDefault()
            return $uibModalInstance.dismiss('signup')
          }

          return $scope.openResetPassword = function (e) {
            e.preventDefault()
            return $uibModalInstance.dismiss('resetPassword')
          }
        }
        ] })

      // what to do when the modal is closed
        .result['finally'](null).then(function (user) {
          // authentification succeeded, set the session, gather the notifications and redirect
          $scope.setCurrentUser(user)

          if ((toState !== null) && (toParams !== null)) {
            return $state.go(toState, toParams)
          }
        }

        , function (reason) {
          // authentification did not ended successfully
          if (reason === 'signup') {
            // open signup modal
            return $scope.signup()
          } else if (reason === 'resetPassword') {
            // open the 'reset password' modal
            return $uibModal.open({
              templateUrl: '<%= asset_path "shared/passwordNewModal.html" %>',
              size: 'sm',
              controller: ['$scope', '$uibModalInstance', '$http', function ($scope, $uibModalInstance, $http) {
                $scope.user = { email: '' }
                return $scope.sendReset = function () {
                  $scope.alerts = []
                  return $http.post('/users/password.json', { user: $scope.user }).success(() => $uibModalInstance.close()).error(() =>
                    $scope.alerts.push({
                      msg: _t('your_email_address_is_unknown'),
                      type: 'danger'
                    })
                  )
                }
              }

              ] })
              .result['finally'](null).then(() => growl.info(_t('you_will_receive_in_a_moment_an_email_with_instructions_to_reset_your_password')))
          }
        })
    }

    // otherwise the user just closed the modal
    // <% end %>

    // #
    // Detect if the current page (tab/window) is active of put as background.
    // When the status changes, the callback is triggered with the new status as parameter
    // Inspired by http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active#answer-1060034
    // #
    var onPageVisible = function (callback) {
      let hidden = 'hidden'

      const onchange = function (evt) {
        const v = 'visible'
        const h = 'hidden'
        const evtMap = {
          focus: v,
          focusin: v,
          pageshow: v,
          blur: h,
          focusout: h,
          pagehide: h
        }
        evt = evt || window.event
        if (evt.type in evtMap) {
          if (typeof callback === 'function') { callback(evtMap[evt.type]) }
        } else {
          if (typeof callback === 'function') { callback(this[hidden] ? 'hidden' : 'visible') }
        }
      }

      // Standards:
      if (hidden in document) {
        document.addEventListener('visibilitychange', onchange)
      } else if ((hidden = 'mozHidden') in document) {
        document.addEventListener('mozvisibilitychange', onchange)
      } else if ((hidden = 'webkitHidden') in document) {
        document.addEventListener('webkitvisibilitychange', onchange)
      } else if ((hidden = 'msHidden') in document) {
        document.addEventListener('msvisibilitychange', onchange)
        // IE 9 and lower
      } else if ('onfocusin' in document) {
        document.onfocusin = (document.onfocusout = onchange)
        // All others
      } else {
        window.onpageshow = (window.onpagehide = (window.onfocus = (window.onblur = onchange)))
      }
      // set the initial state (but only if browser supports the Page Visibility API)
      if (document[hidden] !== undefined) {
        return onchange({ type: document[hidden] ? 'blur' : 'focus' })
      }
    }

    // # !!! MUST BE CALLED AT THE END of the controller
    return initialize()
  }
])
