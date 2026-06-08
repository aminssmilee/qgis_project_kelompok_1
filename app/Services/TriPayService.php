<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Payment;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class TriPayService
{
    public function __construct(
        private ?string $apiKey = null,
        private ?string $privateKey = null,
        private ?string $merchantCode = null,
        private ?string $baseUrl = null,
    ) {
        $this->apiKey ??= config('services.tripay.api_key');
        $this->privateKey ??= config('services.tripay.private_key');
        $this->merchantCode ??= config('services.tripay.merchant_code');
        $this->baseUrl ??= config('services.tripay.mode') === 'sandbox'
            ? 'https://tripay.co.id/api-sandbox/'
            : 'https://tripay.co.id/api/';
    }

    /**
     * Get available payment methods (BRI, QRIS, etc)
     */
    public function getPaymentChannels(): ?array
    {
        if ($this->isMock()) {
            return [
                'success' => true,
                'message' => 'Success (Mock Mode)',
                'data' => [
                    [
                        'code' => 'BRIVA',
                        'name' => 'BRI Virtual Account',
                        'payment_method' => 'Virtual Account',
                        'active' => true,
                    ],
                    [
                        'code' => 'BCAVA',
                        'name' => 'BCA Virtual Account',
                        'payment_method' => 'Virtual Account',
                        'active' => true,
                    ],
                    [
                        'code' => 'QRIS',
                        'name' => 'QRIS (Gopay/OVO/Dana)',
                        'payment_method' => 'QR Code',
                        'active' => true,
                    ],
                ],
            ];
        }

        try {
            $response = Http::withoutVerifying()
                ->withHeaders(['Authorization' => 'Bearer '.$this->apiKey])
                ->get($this->baseUrl.'merchant/payment-channel');

            return $response->json();
        } catch (Exception $e) {
            Log::error('TriPay Channels Error: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Create a payment transaction
     */
    public function createTransaction(Payment $payment, string $methodCode): ?array
    {
        $booking = $payment->booking;
        $amount = (int) $payment->amount;
        $merchantRef = $payment->tripay_merchant_ref;

        if ($this->isMock()) {
            return [
                'success' => true,
                'message' => 'Success (Mock Mode)',
                'data' => [
                    'reference' => 'DEV-REF-'.Str::upper(Str::random(10)),
                    'merchant_ref' => $merchantRef,
                    'checkout_url' => 'https://tripay.co.id/checkout/mock-payment',
                    'payment_name' => $methodCode,
                    'amount' => $amount,
                    'status' => 'UNPAID',
                ],
            ];
        }

        // Generate Signature
        $signature = hash_hmac('sha256', $this->merchantCode.$merchantRef.$amount, (string) $this->privateKey);

        $payload = [
            'method' => $methodCode,
            'merchant_ref' => $merchantRef,
            'amount' => $amount,
            'customer_name' => $booking->user->name ?? 'Customer',
            'customer_email' => $booking->user->email ?? 'customer@example.com',
            'customer_phone' => $booking->user->phone ?? '08123456789',
            'order_items' => [
                [
                    'sku' => $booking->billboard_id,
                    'name' => 'Rental: '.($booking->billboard->name ?? 'Billboard').' ('.Str::upper($payment->type).')',
                    'price' => $amount,
                    'quantity' => 1,
                ],
            ],
            'callback_url' => url('/api/v1/payment/callback'),
            'return_url' => url('/payment/return'),
            'expired_time' => (time() + (24 * 60 * 60)), // 24 hours
            'signature' => $signature,
        ];

        $response = Http::withoutVerifying()
            ->withHeaders(['Authorization' => 'Bearer '.$this->apiKey])
            ->post($this->baseUrl.'transaction/create', $payload);

        return $response->json();
    }

    /**
     * Verify Webhook Signature
     */
    public function validateCallback(Request $request): bool
    {
        $callbackSignature = $request->header('X-Callback-Signature');
        $signature = hash_hmac('sha256', $request->getContent(), (string) $this->privateKey);

        return $callbackSignature === $signature;
    }

    /**
     * Check if TriPay credentials are mock/placeholders.
     */
    private function isMock(): bool
    {
        return in_array($this->apiKey, [null, '', '0', 'DEV-xxxxxxx'], true)
            || $this->merchantCode === 'Txxxx'
            || $this->privateKey === 'xxxxxxx';
    }
}
