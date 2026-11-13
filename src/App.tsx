import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { NewBookingModal } from './components/NewBookingModal';
import { useHmsState } from './hooks/useHmsState';
import { BillingPage } from './pages/BillingPage';
import { BookingsPage } from './pages/BookingsPage';
import { CalendarPage } from './pages/CalendarPage';
import { CheckInOutPage } from './pages/CheckInOutPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { RoomsPage } from './pages/RoomsPage';
import { SettingsPage } from './pages/SettingsPage';
import type { NavSection } from './types/hms';

export const App: React.FC = () => {
  const {
    state,
    updateRoomStatus,
    updateRoomRate,
    addBooking,
    updateBookingStatus,
    upsertBill,
    updateFoodMenuItem,
    updateSettings,
    setPhotoOverride,
    deleteBooking,
    resetDemo,
  } = useHmsState();

  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [modalInitialRoom, setModalInitialRoom] = useState<string | undefined>(
    undefined
  );
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(
    undefined
  );
  const [selectedBookingIdForBilling, setSelectedBookingIdForBilling] =
    useState<string | null>(null);

  const openNewBookingModal = (roomNumber?: string, dateISO?: string) => {
    setModalInitialRoom(roomNumber);
    setModalInitialDate(dateISO);
    setBookingModalOpen(true);
  };

  const openBillingForBooking = (bookingId: string) => {
    setSelectedBookingIdForBilling(bookingId);
    setActiveSection('billing');
  };

  return (
    <>
      <Layout
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onOpenNewBooking={() => openNewBookingModal()}
        onResetDemo={resetDemo}
        settings={state.settings}
      >
        {activeSection === 'dashboard' && (
          <DashboardPage
            rooms={state.rooms}
            bookings={state.bookings}
            bills={state.bills}
            settings={state.settings}
            customPhotoOverrides={state.customPhotoOverrides}
            onNavigate={setActiveSection}
            onOpenNewBooking={(roomNum) => openNewBookingModal(roomNum)}
            onOpenBillingForBooking={openBillingForBooking}
            onDeleteBooking={deleteBooking}
            onUpdateRoomStatus={updateRoomStatus}
            onResetDemo={resetDemo}
          />
        )}

        {activeSection === 'rooms' && (
          <RoomsPage
            rooms={state.rooms}
            bookings={state.bookings}
            customPhotoOverrides={state.customPhotoOverrides}
            onUpdateStatus={updateRoomStatus}
            onUpdateRate={updateRoomRate}
            onOpenNewBooking={(roomNum) => openNewBookingModal(roomNum)}
          />
        )}

        {activeSection === 'bookings' && (
          <BookingsPage
            bookings={state.bookings}
            onOpenNewBooking={() => openNewBookingModal()}
            onUpdateBookingStatus={updateBookingStatus}
            onOpenBillingForBooking={openBillingForBooking}
            onNavigate={setActiveSection}
            onDeleteBooking={deleteBooking}
          />
        )}

        {activeSection === 'calendar' && (
          <CalendarPage
            rooms={state.rooms}
            bookings={state.bookings}
            onBookSlot={(roomNum, dateISO) =>
              openNewBookingModal(roomNum, dateISO)
            }
          />
        )}

        {activeSection === 'checkin' && (
          <CheckInOutPage
            rooms={state.rooms}
            bookings={state.bookings}
            bills={state.bills}
            onCheckInExisting={updateBookingStatus}
            onWalkInCheckIn={addBooking}
            onCheckOut={updateBookingStatus}
            onOpenBillingForBooking={openBillingForBooking}
          />
        )}

        {activeSection === 'billing' && (
          <BillingPage
            bills={state.bills}
            foodMenu={state.foodMenu}
            settings={state.settings}
            selectedBookingIdForBilling={selectedBookingIdForBilling}
            onUpsertBill={upsertBill}
            onUpdateFoodMenuItem={updateFoodMenuItem}
          />
        )}

        {activeSection === 'reports' && (
          <ReportsPage
            rooms={state.rooms}
            bookings={state.bookings}
            bills={state.bills}
            onOpenBillingForBooking={openBillingForBooking}
          />
        )}

        {activeSection === 'settings' && (
          <SettingsPage
            settings={state.settings}
            customPhotoOverrides={state.customPhotoOverrides}
            onUpdateSettings={updateSettings}
            onSetPhotoOverride={setPhotoOverride}
            onResetDemo={resetDemo}
          />
        )}
      </Layout>

      <NewBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        rooms={state.rooms}
        bookings={state.bookings}
        onCreateBooking={addBooking}
        initialRoomNumber={modalInitialRoom}
        initialCheckInDate={modalInitialDate}
      />
    </>
  );
};

export default App;

