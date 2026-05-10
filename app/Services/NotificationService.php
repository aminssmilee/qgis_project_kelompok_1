<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Booking;
use App\Models\Notification;

final class NotificationService
{
    /**
     * Send notification when a booking is created.
     */
    public function bookingCreated(Booking $booking): void
    {
        Notification::create([
            'user_id' => $booking->user_id,
            'booking_id' => $booking->id,
            'type' => 'booking_created',
            'title' => 'Booking Berhasil Dibuat',
            'message' => "Booking Anda dengan kode {$booking->booking_code} telah berhasil dibuat dan sedang menunggu konfirmasi admin.",
            'is_read' => false,
        ]);
    }

    /**
     * Send notification when admin approves a booking.
     */
    public function bookingApproved(Booking $booking): void
    {
        Notification::create([
            'user_id' => $booking->user_id,
            'booking_id' => $booking->id,
            'type' => 'booking_approved',
            'title' => 'Booking Disetujui! 🎉',
            'message' => "Selamat! Booking Anda dengan kode {$booking->booking_code} telah disetujui oleh admin. Billboard siap digunakan sesuai jadwal.",
            'is_read' => false,
        ]);
    }

    /**
     * Send notification when admin rejects a booking.
     */
    public function bookingRejected(Booking $booking, string $reason): void
    {
        Notification::create([
            'user_id' => $booking->user_id,
            'booking_id' => $booking->id,
            'type' => 'booking_rejected',
            'title' => 'Booking Ditolak',
            'message' => "Mohon maaf, booking Anda dengan kode {$booking->booking_code} ditolak. Alasan: {$reason}",
            'is_read' => false,
        ]);
    }

    /**
     * Send notification when a booking is auto-cancelled due to expiry.
     */
    public function bookingExpired(Booking $booking): void
    {
        Notification::create([
            'user_id' => $booking->user_id,
            'booking_id' => $booking->id,
            'type' => 'booking_expired',
            'title' => 'Booking Dibatalkan Otomatis',
            'message' => "Booking Anda dengan kode {$booking->booking_code} telah dibatalkan secara otomatis karena melewati batas waktu konfirmasi.",
            'is_read' => false,
        ]);
    }
}
