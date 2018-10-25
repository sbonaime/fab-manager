/* eslint-disable
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
angular.module('application.router', ['ui.router'])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.hashPrefix('!')
    $urlRouterProvider.otherwise('/')

    // abstract root parents states
    // these states controls the access rights to the various routes inherited from them
    return $stateProvider
      .state('app', {
        abstract: true,
        views: {
          'header': {
            templateUrl: '<%= asset_path "shared/header.html" %>'
          },
          'leftnav': {
            templateUrl: '<%= asset_path "shared/leftnav.html" %>',
            controller: 'MainNavController'
          },
          'main': {}
        },
        resolve: {
          logoFile: ['CustomAsset', CustomAsset => CustomAsset.get({ name: 'logo-file' }).$promise
          ],
          logoBlackFile: ['CustomAsset', CustomAsset => CustomAsset.get({ name: 'logo-black-file' }).$promise
          ],
          commonTranslations: [ 'Translations', Translations => Translations.query(['app.public.common', 'app.shared.buttons', 'app.shared.elements']).$promise
          ]
        },
        onEnter: ['$rootScope', 'logoFile', 'logoBlackFile', function ($rootScope, logoFile, logoBlackFile) {
          // # Application logo
          $rootScope.logo = logoFile.custom_asset
          return $rootScope.logoBlack = logoBlackFile.custom_asset
        }
        ]
      })
      .state('app.public',
        { abstract: true })
      .state('app.logged', {
        abstract: true,
        data: {
          authorizedRoles: ['member', 'admin']
        },
        resolve: {
          currentUser: ['Auth', Auth => Auth.currentUser()
          ]
        },
        onEnter: ['$state', '$timeout', 'currentUser', '$rootScope', ($state, $timeout, currentUser, $rootScope) => $rootScope.currentUser = currentUser
        ]
      })
      .state('app.admin', {
        abstract: true,
        data: {
          authorizedRoles: ['admin']
        },
        resolve: {
          currentUser: ['Auth', Auth => Auth.currentUser()
          ]
        },
        onEnter: ['$state', '$timeout', 'currentUser', '$rootScope', ($state, $timeout, currentUser, $rootScope) => $rootScope.currentUser = currentUser
        ]
      })

      // main pages
      .state('app.public.about', {
        url: '/about',
        views: {
          'content@': {
            templateUrl: '<%= asset_path "shared/about.html" %>',
            controller: 'AboutController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query('app.public.about').$promise
          ]
        }
      })
      .state('app.public.home', {
        url: '/?reset_password_token',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "home.html" %>',
            controller: 'HomeController'
          }
        },
        resolve: {
          lastMembersPromise: ['Member', Member => Member.lastSubscribed({ limit: 4 }).$promise
          ],
          lastProjectsPromise: ['Project', Project => Project.lastPublished().$promise
          ],
          upcomingEventsPromise: ['Event', Event => Event.upcoming({ limit: 3 }).$promise
          ],
          homeBlogpostPromise: ['Setting', Setting => Setting.get({ name: 'home_blogpost' }).$promise
          ],
          twitterNamePromise: ['Setting', Setting => Setting.get({ name: 'twitter_name' }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.public.home').$promise
          ]
        }
      })

      // profile completion (SSO import passage point)
      .state('app.logged.profileCompletion', {
        url: '/profile_completion',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "profile/complete.html"%>',
            controller: 'CompleteProfileController'
          }
        },
        resolve: {
          settingsPromise: ['Setting', Setting => Setting.query({ names: "['fablab_name', 'name_genre']" }).$promise
          ],
          activeProviderPromise: ['AuthProvider', AuthProvider => AuthProvider.active().$promise
          ],
          groupsPromise: ['Group', Group => Group.query().$promise
          ],
          cguFile: ['CustomAsset', CustomAsset => CustomAsset.get({ name: 'cgu-file' }).$promise
          ],
          memberPromise: ['Member', 'currentUser', (Member, currentUser) => Member.get({ id: currentUser.id }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.logged.profileCompletion', 'app.shared.user']).$promise
          ]
        }
      })

      // dashboard
      .state('app.logged.dashboard', {
        abstract: true,
        url: '/dashboard',
        resolve: {
          memberPromise: ['Member', 'currentUser', (Member, currentUser) => Member.get({ id: currentUser.id }).$promise
          ]
        }
      })
      .state('app.logged.dashboard.profile', {
        url: '/profile',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "dashboard/profile.html" %>',
            controller: 'DashboardController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query(['app.logged.dashboard.profile', 'app.shared.public_profile']).$promise
          ]
        }
      })
      .state('app.logged.dashboard.settings', {
        url: '/settings',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "dashboard/settings.html" %>',
            controller: 'EditProfileController'
          }
        },
        resolve: {
          groups: ['Group', Group => Group.query().$promise
          ],
          activeProviderPromise: ['AuthProvider', AuthProvider => AuthProvider.active().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.logged.dashboard.settings', 'app.shared.user']).$promise
          ]
        }
      })
      .state('app.logged.dashboard.projects', {
        url: '/projects',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "dashboard/projects.html" %>',
            controller: 'DashboardController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query('app.logged.dashboard.projects').$promise
          ]
        }
      })
      .state('app.logged.dashboard.trainings', {
        url: '/trainings',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "dashboard/trainings.html" %>',
            controller: 'DashboardController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query('app.logged.dashboard.trainings').$promise
          ]
        }
      })
      .state('app.logged.dashboard.events', {
        url: '/events',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "dashboard/events.html" %>',
            controller: 'DashboardController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query('app.logged.dashboard.events').$promise
          ]
        }
      })
      .state('app.logged.dashboard.invoices', {
        url: '/invoices',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "dashboard/invoices.html" %>',
            controller: 'DashboardController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query('app.logged.dashboard.invoices').$promise
          ]
        }
      })
      .state('app.logged.dashboard.wallet', {
        url: '/wallet',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "dashboard/wallet.html" %>',
            controller: 'WalletController'
          }
        },
        resolve: {
          walletPromise: ['Wallet', 'currentUser', (Wallet, currentUser) => Wallet.getWalletByUser({ user_id: currentUser.id }).$promise
          ],
          transactionsPromise: ['Wallet', 'walletPromise', (Wallet, walletPromise) => Wallet.transactions({ id: walletPromise.id }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.shared.wallet']).$promise
          ]
        }
      })

      // members
      .state('app.logged.members_show', {
        url: '/members/:id',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "members/show.html" %>',
            controller: 'ShowProfileController'
          }
        },
        resolve: {
          memberPromise: ['$stateParams', 'Member', ($stateParams, Member) => Member.get({ id: $stateParams.id }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.logged.members_show', 'app.shared.public_profile']).$promise
          ]
        }
      })
      .state('app.logged.members', {
        url: '/members',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "members/index.html" %>',
            controller: 'MembersController'
          }
        },
        resolve: {
          membersPromise: ['Member', Member => Member.query({ requested_attributes: '[profile]', page: 1, size: 10 }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.logged.members').$promise
          ]
        }
      })

      // projects
      .state('app.public.projects_list', {
        url: '/projects?q&page&theme_id&component_id&machine_id&from&whole_network',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "projects/index.html.erb" %>',
            controller: 'ProjectsController'
          }
        },
        resolve: {
          themesPromise: ['Theme', Theme => Theme.query().$promise
          ],
          componentsPromise: ['Component', Component => Component.query().$promise
          ],
          machinesPromise: ['Machine', Machine => Machine.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.public.projects_list').$promise
          ]
        }
      })
      .state('app.logged.projects_new', {
        url: '/projects/new',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "projects/new.html" %>',
            controller: 'NewProjectController'
          }
        },
        resolve: {
          allowedExtensions: ['Project', Project => Project.allowedExtensions().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.logged.projects_new', 'app.shared.project']).$promise
          ]
        }
      })
      .state('app.public.projects_show', {
        url: '/projects/:id',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "projects/show.html" %>',
            controller: 'ShowProjectController'
          }
        },
        resolve: {
          projectPromise: ['$stateParams', 'Project', ($stateParams, Project) => Project.get({ id: $stateParams.id }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.public.projects_show').$promise
          ]
        }
      })
      .state('app.logged.projects_edit', {
        url: '/projects/:id/edit',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "projects/edit.html" %>',
            controller: 'EditProjectController'
          }
        },
        resolve: {
          projectPromise: ['$stateParams', 'Project', ($stateParams, Project) => Project.get({ id: $stateParams.id }).$promise
          ],
          allowedExtensions: ['Project', Project => Project.allowedExtensions().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.logged.projects_edit', 'app.shared.project']).$promise
          ]
        }
      })

      // machines
      .state('app.public.machines_list', {
        url: '/machines',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "machines/index.html.erb" %>',
            controller: 'MachinesController'
          }
        },
        resolve: {
          machinesPromise: ['Machine', Machine => Machine.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.public.machines_list', 'app.shared.training_reservation_modal', 'app.shared.request_training_modal']).$promise
          ]
        }
      })
      .state('app.admin.machines_new', {
        url: '/machines/new',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "machines/new.html" %>',
            controller: 'NewMachineController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query(['app.admin.machines_new', 'app.shared.machine']).$promise
          ]
        }
      })
      .state('app.public.machines_show', {
        url: '/machines/:id',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "machines/show.html" %>',
            controller: 'ShowMachineController'
          }
        },
        resolve: {
          machinePromise: ['Machine', '$stateParams', (Machine, $stateParams) => Machine.get({ id: $stateParams.id }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.public.machines_show', 'app.shared.training_reservation_modal', 'app.shared.request_training_modal']).$promise
          ]
        }
      })
      .state('app.logged.machines_reserve', {
        url: '/machines/:id/reserve',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "machines/reserve.html" %>',
            controller: 'ReserveMachineController'
          }
        },
        resolve: {
          plansPromise: ['Plan', Plan => Plan.query().$promise
          ],
          groupsPromise: ['Group', Group => Group.query().$promise
          ],
          machinePromise: ['Machine', '$stateParams', (Machine, $stateParams) => Machine.get({ id: $stateParams.id }).$promise
          ],
          settingsPromise: ['Setting', Setting =>
            Setting.query({ names: `['machine_explications_alert', \
'booking_window_start', \
'booking_window_end', \
'booking_move_enable', \
'booking_move_delay', \
'booking_cancel_enable', \
'booking_cancel_delay', \
'subscription_explications_alert']` }).$promise

          ],
          translations: [ 'Translations', Translations =>
            Translations.query(['app.logged.machines_reserve', 'app.shared.plan_subscribe', 'app.shared.member_select',
              'app.shared.stripe', 'app.shared.valid_reservation_modal', 'app.shared.confirm_modify_slot_modal',
              'app.shared.wallet', 'app.shared.coupon_input', 'app.shared.cart']).$promise

          ]
        }
      })
      .state('app.admin.machines_edit', {
        url: '/machines/:id/edit',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "machines/edit.html" %>',
            controller: 'EditMachineController'
          }
        },
        resolve: {
          machinePromise: ['Machine', '$stateParams', (Machine, $stateParams) => Machine.get({ id: $stateParams.id }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.machines_edit', 'app.shared.machine']).$promise
          ]
        }
      })

      // spaces
      .state('app.public.spaces_list', {
        url: '/spaces',
        abstract: Fablab.withoutSpaces,
        views: {
          'main@': {
            templateUrl: '<%= asset_path "spaces/index.html" %>',
            controller: 'SpacesController'
          }
        },
        resolve: {
          spacesPromise: ['Space', Space => Space.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.public.spaces_list']).$promise
          ]
        }
      })
      .state('app.admin.space_new', {
        url: '/spaces/new',
        abstract: Fablab.withoutSpaces,
        views: {
          'main@': {
            templateUrl: '<%= asset_path "spaces/new.html" %>',
            controller: 'NewSpaceController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query(['app.admin.space_new', 'app.shared.space']).$promise
          ]
        }
      })
      .state('app.public.space_show', {
        url: '/spaces/:id',
        abstract: Fablab.withoutSpaces,
        views: {
          'main@': {
            templateUrl: '<%= asset_path "spaces/show.html" %>',
            controller: 'ShowSpaceController'
          }
        },
        resolve: {
          spacePromise: ['Space', '$stateParams', (Space, $stateParams) => Space.get({ id: $stateParams.id }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.public.space_show']).$promise
          ]
        }
      })
      .state('app.admin.space_edit', {
        url: '/spaces/:id/edit',
        abstract: Fablab.withoutSpaces,
        views: {
          'main@': {
            templateUrl: '<%= asset_path "spaces/edit.html" %>',
            controller: 'EditSpaceController'
          }
        },
        resolve: {
          spacePromise: ['Space', '$stateParams', (Space, $stateParams) => Space.get({ id: $stateParams.id }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.space_edit', 'app.shared.space']).$promise
          ]
        }
      })
      .state('app.logged.space_reserve', {
        url: '/spaces/:id/reserve',
        abstract: Fablab.withoutSpaces,
        views: {
          'main@': {
            templateUrl: '<%= asset_path "spaces/reserve.html" %>',
            controller: 'ReserveSpaceController'
          }
        },
        resolve: {
          spacePromise: ['Space', '$stateParams', (Space, $stateParams) => Space.get({ id: $stateParams.id }).$promise
          ],
          availabilitySpacesPromise: ['Availability', '$stateParams', (Availability, $stateParams) => Availability.spaces({ spaceId: $stateParams.id }).$promise
          ],
          plansPromise: ['Plan', Plan => Plan.query().$promise
          ],
          groupsPromise: ['Group', Group => Group.query().$promise
          ],
          settingsPromise: ['Setting', Setting =>
            Setting.query({ names: `['booking_window_start', \
'booking_window_end', \
'booking_move_enable', \
'booking_move_delay', \
'booking_cancel_enable', \
'booking_cancel_delay', \
'subscription_explications_alert', \
'space_explications_alert']` }).$promise

          ],
          translations: [ 'Translations', Translations =>
            Translations.query(['app.logged.space_reserve', 'app.shared.plan_subscribe', 'app.shared.member_select',
              'app.shared.stripe', 'app.shared.valid_reservation_modal', 'app.shared.confirm_modify_slot_modal',
              'app.shared.wallet', 'app.shared.coupon_input', 'app.shared.cart']).$promise

          ]
        }
      })

      // trainings
      .state('app.public.trainings_list', {
        url: '/trainings',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "trainings/index.html.erb" %>',
            controller: 'TrainingsController'
          }
        },
        resolve: {
          trainingsPromise: ['Training', Training => Training.query({ public_page: true }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.public.trainings_list']).$promise
          ]
        }
      })
      .state('app.public.training_show', {
        url: '/trainings/:id',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "trainings/show.html" %>',
            controller: 'ShowTrainingController'
          }
        },
        resolve: {
          trainingPromise: ['Training', '$stateParams', (Training, $stateParams) => Training.get({ id: $stateParams.id }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.public.training_show']).$promise
          ]
        }
      })
      .state('app.logged.trainings_reserve', {
        url: '/trainings/:id/reserve',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "trainings/reserve.html" %>',
            controller: 'ReserveTrainingController'
          }
        },
        resolve: {
          explicationAlertPromise: ['Setting', Setting => Setting.get({ name: 'training_explications_alert' }).$promise
          ],
          plansPromise: ['Plan', Plan => Plan.query().$promise
          ],
          groupsPromise: ['Group', Group => Group.query().$promise
          ],
          availabilityTrainingsPromise: ['Availability', '$stateParams', (Availability, $stateParams) => Availability.trainings({ trainingId: $stateParams.id }).$promise
          ],
          trainingPromise: ['Training', '$stateParams', function (Training, $stateParams) {
            if ($stateParams.id !== 'all') { return Training.get({ id: $stateParams.id }).$promise }
          }
          ],
          settingsPromise: ['Setting', Setting =>
            Setting.query({ names: `['booking_window_start', \
'booking_window_end', \
'booking_move_enable', \
'booking_move_delay', \
'booking_cancel_enable', \
'booking_cancel_delay', \
'subscription_explications_alert', \
'training_explications_alert', \
'training_information_message']` }).$promise

          ],
          translations: [ 'Translations', Translations =>
            Translations.query(['app.logged.trainings_reserve', 'app.shared.plan_subscribe', 'app.shared.member_select',
              'app.shared.stripe', 'app.shared.valid_reservation_modal', 'app.shared.confirm_modify_slot_modal',
              'app.shared.wallet', 'app.shared.coupon_input', 'app.shared.cart']).$promise

          ]
        }
      })
      // notifications
      .state('app.logged.notifications', {
        url: '/notifications',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "notifications/index.html.erb" %>',
            controller: 'NotificationsController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query('app.logged.notifications').$promise
          ]
        }
      })

      // pricing
      .state('app.public.plans', {
        url: '/plans',
        abstract: Fablab.withoutPlans,
        views: {
          'main@': {
            templateUrl: '<%= asset_path "plans/index.html.erb" %>',
            controller: 'PlansIndexController'
          }
        },
        resolve: {
          subscriptionExplicationsPromise: ['Setting', Setting => Setting.get({ name: 'subscription_explications_alert' }).$promise
          ],
          plansPromise: ['Plan', Plan => Plan.query().$promise
          ],
          groupsPromise: ['Group', Group => Group.query().$promise
          ],
          translations: [ 'Translations', Translations =>
            Translations.query(['app.public.plans', 'app.shared.member_select', 'app.shared.stripe', 'app.shared.wallet',
              'app.shared.coupon_input']).$promise

          ]
        }
      })

      // events
      .state('app.public.events_list', {
        url: '/events',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "events/index.html.erb" %>',
            controller: 'EventsController'
          }
        },
        resolve: {
          categoriesPromise: ['Category', Category => Category.query().$promise
          ],
          themesPromise: ['EventTheme', EventTheme => EventTheme.query().$promise
          ],
          ageRangesPromise: ['AgeRange', AgeRange => AgeRange.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.public.events_list').$promise
          ]
        }
      })
      .state('app.public.events_show', {
        url: '/events/:id',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "events/show.html" %>',
            controller: 'ShowEventController'
          }
        },
        resolve: {
          eventPromise: ['Event', '$stateParams', (Event, $stateParams) => Event.get({ id: $stateParams.id }).$promise
          ],
          priceCategoriesPromise: ['PriceCategory', PriceCategory => PriceCategory.query().$promise
          ],
          settingsPromise: ['Setting', Setting => Setting.query({ names: "['booking_move_enable', 'booking_move_delay', 'event_explications_alert']" }).$promise
          ],
          translations: [ 'Translations', Translations =>
            Translations.query(['app.public.events_show', 'app.shared.member_select', 'app.shared.stripe',
              'app.shared.valid_reservation_modal', 'app.shared.wallet', 'app.shared.coupon_input']).$promise

          ]
        }
      })

      // global calendar (trainings, machines and events)
      .state('app.public.calendar', {
        url: '/calendar',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "calendar/calendar.html" %>',
            controller: 'CalendarController'
          }
        },
        resolve: {
          bookingWindowStart: ['Setting', Setting => Setting.get({ name: 'booking_window_start' }).$promise
          ],
          bookingWindowEnd: ['Setting', Setting => Setting.get({ name: 'booking_window_end' }).$promise
          ],
          trainingsPromise: ['Training', Training => Training.query().$promise
          ],
          machinesPromise: ['Machine', Machine => Machine.query().$promise
          ],
          spacesPromise: ['Space', Space => Space.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.public.calendar']).$promise
          ]
        }
      })

      // --- namespace /admin/... ---
      // calendar
      .state('app.admin.calendar', {
        url: '/admin/calendar',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/calendar/calendar.html" %>',
            controller: 'AdminCalendarController'
          }
        },
        resolve: {
          bookingWindowStart: ['Setting', Setting => Setting.get({ name: 'booking_window_start' }).$promise
          ],
          bookingWindowEnd: ['Setting', Setting => Setting.get({ name: 'booking_window_end' }).$promise
          ],
          machinesPromise: ['Machine', Machine => Machine.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.admin.calendar').$promise
          ]
        }
      })

      // project's elements
      .state('app.admin.project_elements', {
        url: '/admin/project_elements',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/project_elements/index.html.erb" %>',
            controller: 'ProjectElementsController'
          }
        },
        resolve: {
          componentsPromise: ['Component', Component => Component.query().$promise
          ],
          licencesPromise: ['Licence', Licence => Licence.query().$promise
          ],
          themesPromise: ['Theme', Theme => Theme.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.admin.project_elements').$promise
          ]
        }
      })

      // trainings
      .state('app.admin.trainings', {
        url: '/admin/trainings',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/trainings/index.html.erb" %>',
            controller: 'TrainingsAdminController'
          }
        },
        resolve: {
          trainingsPromise: ['Training', Training => Training.query().$promise
          ],
          machinesPromise: ['Machine', Machine => Machine.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.trainings', 'app.shared.trainings']).$promise
          ]
        }
      })
      .state('app.admin.trainings_new', {
        url: '/admin/trainings/new',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/trainings/new.html" %>',
            controller: 'NewTrainingController'
          }
        },
        resolve: {
          machinesPromise: ['Machine', Machine => Machine.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.trainings_new', 'app.shared.trainings']).$promise
          ]
        }
      })
      .state('app.admin.trainings_edit', {
        url: '/admin/trainings/:id/edit',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/trainings/edit.html" %>',
            controller: 'EditTrainingController'
          }
        },
        resolve: {
          trainingPromise: ['Training', '$stateParams', (Training, $stateParams) => Training.get({ id: $stateParams.id }).$promise
          ],
          machinesPromise: ['Machine', Machine => Machine.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.shared.trainings').$promise
          ]
        }
      })
      // events
      .state('app.admin.events', {
        url: '/admin/events',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/events/index.html.erb" %>',
            controller: 'AdminEventsController'
          }
        },
        resolve: {
          eventsPromise: ['Event', Event => Event.query({ page: 1 }).$promise
          ],
          categoriesPromise: ['Category', Category => Category.query().$promise
          ],
          themesPromise: ['EventTheme', EventTheme => EventTheme.query().$promise
          ],
          ageRangesPromise: ['AgeRange', AgeRange => AgeRange.query().$promise
          ],
          priceCategoriesPromise: ['PriceCategory', PriceCategory => PriceCategory.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.admin.events').$promise
          ]
        }
      })
      .state('app.admin.events_new', {
        url: '/admin/events/new',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "events/new.html" %>',
            controller: 'NewEventController'
          }
        },
        resolve: {
          categoriesPromise: ['Category', Category => Category.query().$promise
          ],
          themesPromise: ['EventTheme', EventTheme => EventTheme.query().$promise
          ],
          ageRangesPromise: ['AgeRange', AgeRange => AgeRange.query().$promise
          ],
          priceCategoriesPromise: ['PriceCategory', PriceCategory => PriceCategory.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.events_new', 'app.shared.event']).$promise
          ]
        }
      })
      .state('app.admin.events_edit', {
        url: '/admin/events/:id/edit',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "events/edit.html" %>',
            controller: 'EditEventController'
          }
        },
        resolve: {
          eventPromise: ['Event', '$stateParams', (Event, $stateParams) => Event.get({ id: $stateParams.id }).$promise
          ],
          categoriesPromise: ['Category', Category => Category.query().$promise
          ],
          themesPromise: ['EventTheme', EventTheme => EventTheme.query().$promise
          ],
          ageRangesPromise: ['AgeRange', AgeRange => AgeRange.query().$promise
          ],
          priceCategoriesPromise: ['PriceCategory', PriceCategory => PriceCategory.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.events_edit', 'app.shared.event']).$promise
          ]
        }
      })
      .state('app.admin.event_reservations', {
        url: '/admin/events/:id/reservations',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/events/reservations.html" %>',
            controller: 'ShowEventReservationsController'
          }
        },
        resolve: {
          eventPromise: ['Event', '$stateParams', (Event, $stateParams) => Event.get({ id: $stateParams.id }).$promise
          ],
          reservationsPromise: ['Reservation', '$stateParams', (Reservation, $stateParams) => Reservation.query({ reservable_id: $stateParams.id, reservable_type: 'Event' }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.admin.event_reservations').$promise
          ]
        }
      })

      // pricing
      .state('app.admin.pricing', {
        url: '/admin/pricing',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/pricing/index.html.erb" %>',
            controller: 'EditPricingController'
          }
        },
        resolve: {
          plans: ['Plan', Plan => Plan.query().$promise
          ],
          groups: ['Group', Group => Group.query().$promise
          ],
          machinesPricesPromise: ['Price', Price => Price.query({ priceable_type: 'Machine', plan_id: 'null' }).$promise
          ],
          trainingsPricingsPromise: ['TrainingsPricing', TrainingsPricing => TrainingsPricing.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.pricing', 'app.shared.member_select', 'app.shared.coupon']).$promise
          ],
          trainingsPromise: ['Training', Training => Training.query().$promise
          ],
          machineCreditsPromise: ['Credit', Credit => Credit.query({ creditable_type: 'Machine' }).$promise
          ],
          machinesPromise: ['Machine', Machine => Machine.query().$promise
          ],
          trainingCreditsPromise: ['Credit', Credit => Credit.query({ creditable_type: 'Training' }).$promise
          ],
          couponsPromise: ['Coupon', Coupon => Coupon.query().$promise
          ],
          spacesPromise: ['Space', Space => Space.query().$promise
          ],
          spacesPricesPromise: ['Price', Price => Price.query({ priceable_type: 'Space', plan_id: 'null' }).$promise
          ],
          spacesCreditsPromise: ['Credit', Credit => Credit.query({ creditable_type: 'Space' }).$promise
          ]
        }
      })

      // plans
      .state('app.admin.plans', {
        abstract: true,
        resolve: {
          prices: ['Pricing', Pricing => Pricing.query().$promise
          ],
          groups: ['Group', Group => Group.query().$promise
          ],
          partners: ['User', User => User.query({ role: 'partner' }).$promise
          ]
        }
      })
      .state('app.admin.plans.new', {
        url: '/admin/plans/new',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/plans/new.html" %>',
            controller: 'NewPlanController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query(['app.admin.plans.new', 'app.shared.plan']).$promise
          ]
        }
      })
      .state('app.admin.plans.edit', {
        url: '/admin/plans/:id/edit',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/plans/edit.html" %>',
            controller: 'EditPlanController'
          }
        },
        resolve: {
          spaces: ['Space', Space => Space.query().$promise
          ],
          machines: ['Machine', Machine => Machine.query().$promise
          ],
          plans: ['Plan', Plan => Plan.query().$promise
          ],
          planPromise: ['Plan', '$stateParams', (Plan, $stateParams) => Plan.get({ id: $stateParams.id }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.plans.edit', 'app.shared.plan']).$promise
          ]
        }
      })

      // coupons
      .state('app.admin.coupons_new', {
        url: '/admin/coupons/new',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/coupons/new.html" %>',
            controller: 'NewCouponController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query(['app.admin.coupons_new', 'app.shared.coupon']).$promise
          ]
        }
      })
      .state('app.admin.coupons_edit', {
        url: '/admin/coupons/:id/edit',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/coupons/edit.html" %>',
            controller: 'EditCouponController'
          }
        },
        resolve: {
          couponPromise: ['Coupon', '$stateParams', (Coupon, $stateParams) => Coupon.get({ id: $stateParams.id }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.coupons_edit', 'app.shared.coupon']).$promise
          ]
        }
      })

      // invoices
      .state('app.admin.invoices', {
        url: '/admin/invoices',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/invoices/index.html.erb" %>',
            controller: 'InvoicesController'
          }
        },
        resolve: {
          settings: ['Setting', Setting =>
            Setting.query({ names: `[ \
'invoice_legals', \
'invoice_text', \
'invoice_VAT-rate', \
'invoice_VAT-active', \
'invoice_order-nb', \
'invoice_code-value', \
'invoice_code-active', \
'invoice_reference', \
'invoice_logo' \
]` }).$promise

          ],
          invoices: [ 'Invoice', Invoice =>
            Invoice.list({
              query: { number: '', customer: '', date: null, order_by: '-reference', page: 1, size: 20 }
            }).$promise

          ],
          translations: [ 'Translations', Translations => Translations.query('app.admin.invoices').$promise
          ]
        }
      })

      // members
      .state('app.admin.members', {
        url: '/admin/members',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/members/index.html.erb" %>',
            controller: 'AdminMembersController'
          },
          'groups@app.admin.members': {
            templateUrl: '<%= asset_path "admin/groups/index.html.erb" %>',
            controller: 'GroupsController'
          },
          'tags@app.admin.members': {
            templateUrl: '<%= asset_path "admin/tags/index.html.erb" %>',
            controller: 'TagsController'
          },
          'authentification@app.admin.members': {
            templateUrl: '<%= asset_path "admin/authentications/index.html.erb" %>',
            controller: 'AuthentificationController'
          }
        },
        resolve: {
          membersPromise: ['Member', Member => Member.list({ query: { search: '', order_by: 'id', page: 1, size: 20 } }).$promise
          ],
          adminsPromise: ['Admin', Admin => Admin.query().$promise
          ],
          groupsPromise: ['Group', Group => Group.query().$promise
          ],
          tagsPromise: ['Tag', Tag => Tag.query().$promise
          ],
          authProvidersPromise: ['AuthProvider', AuthProvider => AuthProvider.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.admin.members').$promise
          ]
        }
      })
      .state('app.admin.members_new', {
        url: '/admin/members/new',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/members/new.html" %>',
            controller: 'NewMemberController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query(['app.admin.members_new', 'app.shared.user', 'app.shared.user_admin']).$promise
          ]
        }
      })
      .state('app.admin.members_edit', {
        url: '/admin/members/:id/edit',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/members/edit.html" %>',
            controller: 'EditMemberController'
          }
        },
        resolve: {
          memberPromise: ['Member', '$stateParams', (Member, $stateParams) => Member.get({ id: $stateParams.id }).$promise
          ],
          activeProviderPromise: ['AuthProvider', AuthProvider => AuthProvider.active().$promise
          ],
          walletPromise: ['Wallet', '$stateParams', (Wallet, $stateParams) => Wallet.getWalletByUser({ user_id: $stateParams.id }).$promise
          ],
          transactionsPromise: ['Wallet', 'walletPromise', (Wallet, walletPromise) => Wallet.transactions({ id: walletPromise.id }).$promise
          ],
          tagsPromise: ['Tag', Tag => Tag.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.members_edit', 'app.shared.user', 'app.shared.user_admin', 'app.shared.wallet']).$promise
          ]
        }
      })
      .state('app.admin.admins_new', {
        url: '/admin/admins/new',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/admins/new.html" %>',
            controller: 'NewAdminController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query('app.admin.admins_new').$promise
          ]
        }
      })

      // authentification providers
      .state('app.admin.authentication_new', {
        url: '/admin/authentications/new',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/authentications/new.html" %>',
            controller: 'NewAuthenticationController'
          }
        },
        resolve: {
          mappingFieldsPromise: ['AuthProvider', AuthProvider => AuthProvider.mapping_fields().$promise
          ],
          authProvidersPromise: ['AuthProvider', AuthProvider => AuthProvider.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.authentication_new', 'app.shared.authentication', 'app.shared.oauth2']).$promise
          ]
        }
      })
      .state('app.admin.authentication_edit', {
        url: '/admin/authentications/:id/edit',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/authentications/edit.html" %>',
            controller: 'EditAuthenticationController'
          }
        },
        resolve: {
          providerPromise: ['AuthProvider', '$stateParams', (AuthProvider, $stateParams) => AuthProvider.get({ id: $stateParams.id }).$promise
          ],
          mappingFieldsPromise: ['AuthProvider', AuthProvider => AuthProvider.mapping_fields().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query(['app.admin.authentication_edit', 'app.shared.authentication', 'app.shared.oauth2']).$promise
          ]
        }
      })

      // statistics
      .state('app.admin.statistics', {
        url: '/admin/statistics',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/statistics/index.html.erb" %>',
            controller: 'StatisticsController'
          }
        },
        resolve: {
          membersPromise: ['Member', Member => Member.mapping().$promise
          ],
          statisticsPromise: ['Statistics', Statistics => Statistics.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.admin.statistics').$promise
          ]
        }
      })
      .state('app.admin.stats_graphs', {
        url: '/admin/statistics/evolution',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/statistics/graphs.html" %>',
            controller: 'GraphsController'
          }
        },
        resolve: {
          translations: [ 'Translations', Translations => Translations.query('app.admin.stats_graphs').$promise
          ]
        }
      })

      // configurations
      .state('app.admin.settings', {
        url: '/admin/settings',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/settings/index.html.erb" %>',
            controller: 'SettingsController'
          }
        },
        resolve: {
          settingsPromise: ['Setting', Setting =>
            Setting.query({ names: `[ \
'twitter_name', \
'about_title', \
'about_body', \
'about_contacts', \
'home_blogpost', \
'machine_explications_alert', \
'training_explications_alert', \
'training_information_message', \
'subscription_explications_alert', \
'event_explications_alert', \
'space_explications_alert', \
'booking_window_start', \
'booking_window_end', \
'booking_move_enable', \
'booking_move_delay', \
'booking_cancel_enable', \
'booking_cancel_delay', \
'main_color', \
'secondary_color', \
'fablab_name', \
'name_genre', \
'reminder_enable', \
'reminder_delay', \
'visibility_yearly', \
'visibility_others', \
'display_name_enable', \
'machines_sort_by' \
]` }).$promise

          ],
          cguFile: ['CustomAsset', CustomAsset => CustomAsset.get({ name: 'cgu-file' }).$promise
          ],
          cgvFile: ['CustomAsset', CustomAsset => CustomAsset.get({ name: 'cgv-file' }).$promise
          ],
          faviconFile: ['CustomAsset', CustomAsset => CustomAsset.get({ name: 'favicon-file' }).$promise
          ],
          profileImageFile: ['CustomAsset', CustomAsset => CustomAsset.get({ name: 'profile-image-file' }).$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.admin.settings').$promise
          ]
        }
      })

      // OpenAPI Clients
      .state('app.admin.open_api_clients', {
        url: '/open_api_clients',
        views: {
          'main@': {
            templateUrl: '<%= asset_path "admin/open_api_clients/index.html.erb" %>',
            controller: 'OpenAPIClientsController'
          }
        },
        resolve: {
          clientsPromise: ['OpenAPIClient', OpenAPIClient => OpenAPIClient.query().$promise
          ],
          translations: [ 'Translations', Translations => Translations.query('app.admin.open_api_clients').$promise
          ]
        }
      })
  }

  ])
