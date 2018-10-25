/* eslint-disable
    handle-callback-err,
    no-return-assign,
    no-self-compare,
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

// #
// Public listing of the trainings
// #
Application.Controllers.controller('TrainingsController', ['$scope', '$state', 'trainingsPromise', function ($scope, $state, trainingsPromise) {
  // # List of trainings
  $scope.trainings = trainingsPromise

  // #
  // Callback for the 'reserve' button
  // #
  $scope.reserveTraining = (training, event) => $state.go('app.logged.trainings_reserve', { id: training.slug })

  // #
  // Callback for the 'show' button
  // #
  return $scope.showTraining = training => $state.go('app.public.training_show', { id: training.slug })
}
])

// #
// Public view of a specific training
// #
Application.Controllers.controller('ShowTrainingController', ['$scope', '$state', 'trainingPromise', 'growl', '_t', 'dialogs', function ($scope, $state, trainingPromise, growl, _t, dialogs) {
  // # Current training
  $scope.training = trainingPromise

  // #
  // Callback to delete the current training (admins only)
  // #
  $scope.delete = function (training) {
    // check the permissions
    if ($scope.currentUser.role !== 'admin') {
      return console.error(_t('unauthorized_operation'))
    } else {
      return dialogs.confirm({
        resolve: {
          object () {
            return {
              title: _t('confirmation_required'),
              msg: _t('do_you_really_want_to_delete_this_training')
            }
          }
        }
      }
      , () => // deletion confirmed
        // delete the training then redirect to the trainings listing
        training.$delete(() => $state.go('app.public.trainings_list')
          , error => growl.warning(_t('the_training_cant_be_deleted_because_it_is_already_reserved_by_some_users')))
      )
    }
  }

  // #
  // Callback for the 'reserve' button
  // #
  $scope.reserveTraining = (training, event) => $state.go('app.logged.trainings_reserve', { id: training.id })

  // #
  // Revert view to the full list of trainings ("<-" button)
  // #
  return $scope.cancel = event => $state.go('app.public.trainings_list')
}
])

// #
// Controller used in the training reservation agenda page.
// This controller is very similar to the machine reservation controller with one major difference: here, ONLY ONE
// training can be reserved during the reservation process (the shopping cart may contains only one training and a subscription).
// #

Application.Controllers.controller('ReserveTrainingController', ['$scope', '$stateParams', 'Auth', '$timeout', 'Availability', 'Member', 'availabilityTrainingsPromise', 'plansPromise', 'groupsPromise', 'settingsPromise', 'trainingPromise', '_t', 'uiCalendarConfig', 'CalendarConfig',
  function ($scope, $stateParams, Auth, $timeout, Availability, Member, availabilityTrainingsPromise, plansPromise, groupsPromise, settingsPromise, trainingPromise, _t, uiCalendarConfig, CalendarConfig) {
  /* PRIVATE STATIC CONSTANTS */

    // Color of the selected event backgound
    const SELECTED_EVENT_BG_COLOR = '#ffdd00'

    // Slot free to be booked
    const FREE_SLOT_BORDER_COLOR = '<%= AvailabilityHelper::TRAINING_COLOR %>'

    /* PUBLIC SCOPE */

    // # bind the trainings availabilities with full-Calendar events
    $scope.eventSources = [ { events: availabilityTrainingsPromise, textColor: 'black' } ]

    // # the user to deal with, ie. the current user for non-admins
    $scope.ctrl =
    { member: {} }

    // # list of plans, classified by group
    $scope.plansClassifiedByGroup = []
    for (let group of Array.from(groupsPromise)) {
      const groupObj = { id: group.id, name: group.name, plans: [] }
      for (let plan of Array.from(plansPromise)) {
        if (plan.group_id === group.id) { groupObj.plans.push(plan) }
      }
      $scope.plansClassifiedByGroup.push(groupObj)
    }

    // # mapping of fullCalendar events.
    $scope.events = {
      reserved: [], // Slots that the user wants to book
      modifiable: null, // Slot that the user wants to change
      placable: null, // Destination slot for the change
      paid: [], // Slots that were just booked by the user (transaction ok)
      moved: null // Slots that were just moved by the user (change done) -> {newSlot:* oldSlot: *}
    }

    // # the moment when the slot selection changed for the last time, used to trigger changes in the cart
    $scope.selectionTime = null

    // # the last clicked event in the calender
    $scope.selectedEvent = null

    // # indicates the state of the current view : calendar or plans information
    $scope.plansAreShown = false

    // # will store the user's plan if he choosed to buy one
    $scope.selectedPlan = null

    // # the moment when the plan selection changed for the last time, used to trigger changes in the cart
    $scope.planSelectionTime = null

    // # Selected training
    $scope.training = trainingPromise

    // # 'all' OR training's slug
    $scope.mode = $stateParams.id

    // # fullCalendar (v2) configuration
    $scope.calendarConfig = CalendarConfig({
      minTime: moment.duration(moment(settingsPromise.booking_window_start).format('HH:mm:ss')),
      maxTime: moment.duration(moment(settingsPromise.booking_window_end).format('HH:mm:ss')),
      eventClick (event, jsEvent, view) {
        return calendarEventClickCb(event, jsEvent, view)
      },
      eventRender (event, element, view) {
        return eventRenderCb(event, element, view)
      }
    })

    // # Application global settings
    $scope.settings = settingsPromise

    // # Global config: message to the end user concerning the subscriptions rules
    $scope.subscriptionExplicationsAlert = settingsPromise.subscription_explications_alert

    // # Global config: message to the end user concerning the training reservation
    $scope.trainingExplicationsAlert = settingsPromise.training_explications_alert

    // # Global config: message to the end user giving advice about the training reservation
    $scope.trainingInformationMessage = settingsPromise.training_information_message

    // #
    // Change the last selected slot's appearence to looks like 'added to cart'
    // #
    $scope.markSlotAsAdded = function () {
      $scope.selectedEvent.backgroundColor = SELECTED_EVENT_BG_COLOR
      return updateCalendar()
    }

    // #
    // Change the last selected slot's appearence to looks like 'never added to cart'
    // #
    $scope.markSlotAsRemoved = function (slot) {
      slot.backgroundColor = 'white'
      slot.title = slot.training.name
      slot.borderColor = FREE_SLOT_BORDER_COLOR
      slot.id = null
      slot.isValid = false
      slot.is_reserved = false
      slot.can_modify = false
      slot.offered = false
      if (slot.is_completed) { slot.is_completed = false }
      return updateCalendar()
    }

    // #
    // Callback when a slot was successfully cancelled. Reset the slot style as 'ready to book'
    // #
    $scope.slotCancelled = () => $scope.markSlotAsRemoved($scope.selectedEvent)

    // #
    // Change the last selected slot's appearence to looks like 'currently looking for a new destination to exchange'
    // #
    $scope.markSlotAsModifying = function () {
      $scope.selectedEvent.backgroundColor = '#eee'
      $scope.selectedEvent.title = $scope.selectedEvent.training.name + ' - ' + _t('i_change')
      return updateCalendar()
    }

    // #
    // Change the last selected slot's appearence to looks like 'the slot being exchanged will take this place'
    // #
    $scope.changeModifyTrainingSlot = function () {
      if ($scope.events.placable) {
        $scope.events.placable.backgroundColor = 'white'
        $scope.events.placable.title = $scope.events.placable.training.name
      }
      if (!$scope.events.placable || ($scope.events.placable._id !== $scope.selectedEvent._id)) {
        $scope.selectedEvent.backgroundColor = '#bbb'
        $scope.selectedEvent.title = $scope.selectedEvent.training.name + ' - ' + _t('i_shift')
      }
      return updateCalendar()
    }

    // #
    // When modifying an already booked reservation, callback when the modification was successfully done.
    // #
    $scope.modifyTrainingSlot = function () {
      $scope.events.placable.title = $scope.currentUser.role !== 'admin' ? $scope.events.placable.training.name + ' - ' + _t('i_ve_reserved') : $scope.events.placable.training.name
      $scope.events.placable.backgroundColor = 'white'
      $scope.events.placable.borderColor = $scope.events.modifiable.borderColor
      $scope.events.placable.id = $scope.events.modifiable.id
      $scope.events.placable.is_reserved = true
      $scope.events.placable.can_modify = true

      $scope.events.modifiable.backgroundColor = 'white'
      $scope.events.modifiable.title = $scope.events.modifiable.training.name
      $scope.events.modifiable.borderColor = FREE_SLOT_BORDER_COLOR
      $scope.events.modifiable.id = null
      $scope.events.modifiable.is_reserved = false
      $scope.events.modifiable.can_modify = false
      if ($scope.events.modifiable.is_completed) { $scope.events.modifiable.is_completed = false }

      return updateCalendar()
    }

    // #
    // Cancel the current booking modification, reseting the whole process
    // #
    $scope.cancelModifyTrainingSlot = function () {
      if ($scope.events.placable) {
        $scope.events.placable.backgroundColor = 'white'
        $scope.events.placable.title = $scope.events.placable.training.name
      }
      $scope.events.modifiable.title = $scope.currentUser.role !== 'admin' ? $scope.events.modifiable.training.name + ' - ' + _t('i_ve_reserved') : $scope.events.modifiable.training.name
      $scope.events.modifiable.backgroundColor = 'white'

      return updateCalendar()
    }

    // #
    // Callback to deal with the reservations of the user selected in the dropdown list instead of the current user's
    // reservations. (admins only)
    // #
    $scope.updateMember = function () {
      if ($scope.ctrl.member) {
        Member.get({ id: $scope.ctrl.member.id }, function (member) {
          $scope.ctrl.member = member
          const id = $stateParams.id === 'all' ? $stateParams.id : $scope.training.id
          return Availability.trainings({ trainingId: id, member_id: $scope.ctrl.member.id }, function (trainings) {
            uiCalendarConfig.calendars.calendar.fullCalendar('removeEvents')
            return $scope.eventSources.splice(0, 1, {
              events: trainings,
              textColor: 'black'
            }
            )
          })
        })
      }
      // as the events are re-fetched for the new user, we must re-init the cart
      $scope.events.reserved = []
      $scope.selectedPlan = null
      return $scope.plansAreShown = false
    }

    // #
    // Add the provided plan to the current shopping cart
    // @param plan {Object} the plan to subscribe
    // #
    $scope.selectPlan = function (plan) {
    // toggle selected plan
      if ($scope.selectedPlan !== plan) {
        $scope.selectedPlan = plan
      } else {
        $scope.selectedPlan = null
      }
      return $scope.planSelectionTime = new Date()
    }

    // #
    // Changes the user current view from the plan subsription screen to the machine reservation agenda
    // @param e {Object} see https://docs.angularjs.org/guide/expression#-event-
    // #
    $scope.doNotSubscribePlan = function (e) {
      e.preventDefault()
      $scope.plansAreShown = false
      $scope.selectedPlan = null
      return $scope.planSelectionTime = new Date()
    }

    // #
    // Switch the user's view from the reservation agenda to the plan subscription
    // #
    $scope.showPlans = () => $scope.plansAreShown = true

    // #
    // Once the reservation is booked (payment process successfully completed), change the event style
    // in fullCalendar, update the user's subscription and free-credits if needed
    // @param reservation {Object}
    // #
    $scope.afterPayment = function (reservation) {
      $scope.events.paid[0].backgroundColor = 'white'
      $scope.events.paid[0].is_reserved = true
      $scope.events.paid[0].can_modify = true
      updateTrainingSlotId($scope.events.paid[0], reservation)
      $scope.events.paid[0].borderColor = '#b2e774'
      $scope.events.paid[0].title = $scope.events.paid[0].training.name + ' - ' + _t('i_ve_reserved')

      if ($scope.selectedPlan) {
        $scope.ctrl.member.subscribed_plan = angular.copy($scope.selectedPlan)
        Auth._currentUser.subscribed_plan = angular.copy($scope.selectedPlan)
        $scope.plansAreShown = false
        $scope.selectedPlan = null
      }
      $scope.ctrl.member.training_credits = angular.copy(reservation.user.training_credits)
      $scope.ctrl.member.machine_credits = angular.copy(reservation.user.machine_credits)
      Auth._currentUser.training_credits = angular.copy(reservation.user.training_credits)
      Auth._currentUser.machine_credits = angular.copy(reservation.user.machine_credits)

      return refetchCalendar()
    }

    // #
    // To use as callback in Array.prototype.filter to get only enabled plans
    // #
    $scope.filterDisabledPlans = plan => !plan.disabled

    /* PRIVATE SCOPE */

    // #
    // Kind of constructor: these actions will be realized first when the controller is loaded
    // #
    const initialize = function () {
      if ($scope.currentUser.role !== 'admin') {
        return Member.get({ id: $scope.currentUser.id }, member => $scope.ctrl.member = member)
      }
    }

    // #
    // Triggered when the user clicks on a reservation slot in the agenda.
    // Defines the behavior to adopt depending on the slot status (already booked, free, ready to be reserved ...),
    // the user's subscription (current or about to be took) and the time (the user cannot modify a booked reservation
    // if it's too late).
    // @see http://fullcalendar.io/docs/mouse/eventClick/
    // #
    var calendarEventClickCb = function (event, jsEvent, view) {
      $scope.selectedEvent = event
      if ($stateParams.id === 'all') {
        $scope.training = event.training
      }
      return $scope.selectionTime = new Date()
    }

    // #
    // Triggered when fullCalendar tries to graphicaly render an event block.
    // Append the event tag into the block, just after the event title.
    // @see http://fullcalendar.io/docs/event_rendering/eventRender/
    // #
    var eventRenderCb = function (event, element, view) {
      if (($scope.currentUser.role === 'admin') && (event.tags.length > 0)) {
        let html = ''
        for (let tag of Array.from(event.tags)) {
          html += `<span class='label label-success text-white' title='${tag.name}'>${tag.name}</span>`
        }
        element.find('.fc-time').append(html)
      }
    }

    // #
    // After payment, update the id of the newly reserved slot with the id returned by the server.
    // This will allow the user to modify the reservation he just booked.
    // @param slot {Object}
    // @param reservation {Object}
    // #
    var updateTrainingSlotId = (slot, reservation) =>
      angular.forEach(reservation.slots, function (s) {
        if (slot.start_at === slot.start_at) {
          return slot.id = s.id
        }
      })

    // #
    // Update the calendar's display to render the new attributes of the events
    // #
    var updateCalendar = () => uiCalendarConfig.calendars.calendar.fullCalendar('rerenderEvents')

    // #
    // Asynchronously fetch the events from the API and refresh the calendar's view with these new events
    // #
    var refetchCalendar = () =>
      $timeout(function () {
        uiCalendarConfig.calendars.calendar.fullCalendar('refetchEvents')
        return uiCalendarConfig.calendars.calendar.fullCalendar('rerenderEvents')
      })

    // # !!! MUST BE CALLED AT THE END of the controller
    return initialize()
  }

])
