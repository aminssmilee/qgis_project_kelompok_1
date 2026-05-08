@extends('layouts.dashboard', ['title' => 'Penyewaan Billboard'])

@section('content')
    @php
        $formMode = old('form_mode', 'create');
        $recordId = old('record_id', '');
        $currencyFormat = fn ($value) => 'Rp ' . number_format((float) $value, 0, ',', '.');
    @endphp

    <section id="rental-page" data-store-action="{{ route('dashboard.rentals.store') }}" data-update-base="{{ url('/dashboard/rentals') }}" class="space-y-6">
        <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p class="text-sm font-medium text-slate-500">Penyewaan Aktif</p>
                <p class="mt-2 text-3xl font-semibold text-slate-900">{{ $activeRentals }}</p>
            </div>
            <div class="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                <p class="text-sm font-medium text-amber-700">Menunggu Pembayaran</p>
                <p class="mt-2 text-3xl font-semibold text-amber-700">{{ $pendingRentals }}</p>
            </div>
            <div class="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                <p class="text-sm font-medium text-emerald-700">Lunas</p>
                <p class="mt-2 text-3xl font-semibold text-emerald-700">{{ $paidRentals }}</p>
            </div>
        </div>

        <div class="rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div class="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Penyewaan</p>
                    <div class="mt-1 flex flex-wrap items-center gap-3">
                        <h2 class="text-2xl font-semibold text-slate-900">Daftar Penyewaan</h2>
                        <span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{{ $rentals->count() }} data</span>
                    </div>
                    <p class="mt-2 text-sm text-slate-500">Pantau status kontrak, durasi sewa, dan pembayaran setiap klien.</p>
                </div>
                <button type="button" data-open-rental-modal="create" class="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 whitespace-nowrap">
                    + Tambah Penyewaan
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Kode</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Klien</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Billboard</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tanggal & Durasi</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total Harga</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status Bayar</th>
                            <th class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        @forelse ($rentals as $rental)
                            <tr class="transition hover:bg-slate-50">
                                <td class="px-6 py-5 align-top">
                                    <div class="font-semibold text-blue-700">{{ $rental->booking_code }}</div>
                                </td>
                                <td class="px-6 py-5 align-top text-sm text-slate-700">{{ $rental->client?->name ?? '-' }}</td>
                                <td class="px-6 py-5 align-top">
                                    <div class="font-semibold text-slate-900">{{ $rental->billboard?->name ?? '-' }}</div>
                                    <div class="mt-1 text-xs text-slate-500">{{ $rental->billboard?->address ?? '' }}</div>
                                </td>
                                <td class="px-6 py-5 align-top text-sm text-slate-700">
                                    <div>{{ optional($rental->rental_date)->format('d M Y') }}</div>
                                    <div class="mt-1 text-xs text-slate-500">Durasi {{ $rental->duration_days }} hari</div>
                                    <div class="mt-1 text-xs text-slate-500">Selesai {{ optional($rental->end_date)->format('d M Y') }}</div>
                                </td>
                                <td class="px-6 py-5 align-top text-sm font-semibold text-slate-900">{{ $currencyFormat($rental->total_price) }}</td>
                                <td class="px-6 py-5 align-top">
                                    @if ($rental->payment_status === 'Paid')
                                        <span class="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Paid</span>
                                    @elseif ($rental->payment_status === 'Pending')
                                        <span class="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
                                    @else
                                        <span class="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Overdue</span>
                                    @endif
                                </td>
                                <td class="px-6 py-5 align-top text-right">
                                    <div class="flex justify-end gap-2 whitespace-nowrap">
                                        <button
                                            type="button"
                                            data-open-rental-modal="edit"
                                            data-rental-id="{{ $rental->id }}"
                                            data-rental-booking-code="{{ $rental->booking_code }}"
                                            data-rental-client-id="{{ $rental->client_id }}"
                                            data-rental-billboard-id="{{ $rental->billboard_id }}"
                                            data-rental-date="{{ optional($rental->rental_date)->format('Y-m-d') }}"
                                            data-rental-duration-days="{{ $rental->duration_days }}"
                                            data-rental-total-price="{{ $rental->total_price }}"
                                            data-rental-payment-status="{{ $rental->payment_status }}"
                                            class="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                                        >
                                            Edit
                                        </button>
                                        <form action="{{ route('dashboard.rentals.destroy', $rental) }}" method="POST" onsubmit="return confirm('Hapus penyewaan ini?');">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                                                Hapus
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="px-6 py-16 text-center text-sm text-slate-500">
                                    <div class="mx-auto flex max-w-md flex-col items-center gap-4">
                                        <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5A2.25 2.25 0 0 1 5.25 5.25h13.5A2.25 2.25 0 0 1 21 7.5v9A2.25 2.25 0 0 1 18.75 18.75H5.25A2.25 2.25 0 0 1 3 16.5v-9Z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9.75h18" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-base font-semibold text-slate-700">Belum ada data penyewaan</p>
                                            <p class="mt-1 text-sm text-slate-500">Buat kontrak sewa pertama untuk mulai memantau durasi dan pembayaran.</p>
                                        </div>
                                        <button type="button" data-open-rental-modal="create" class="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                                            + Tambah Penyewaan Pertama
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <div id="rental-modal" class="fixed inset-0 z-50 hidden items-center justify-center px-4 py-6">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" data-close-rental-modal></div>
            <div class="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-900/20">
                <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">Form Penyewaan</p>
                        <h3 id="rental-modal-title" class="mt-1 text-xl font-semibold text-slate-900">Tambah Penyewaan</h3>
                    </div>
                    <button type="button" data-close-rental-modal class="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                        ×
                    </button>
                </div>

                <form id="rental-form" method="POST" action="{{ route('dashboard.rentals.store') }}" class="flex-1 space-y-4 overflow-y-auto p-6">
                    @csrf
                    <input type="hidden" name="_method" id="rental-form-method" value="POST">
                    <input type="hidden" name="form_mode" id="rental-form-mode" value="{{ old('form_mode', 'create') }}">
                    <input type="hidden" name="record_id" id="rental-record-id" value="{{ old('record_id') }}">

                    <div class="grid gap-4 md:grid-cols-2">
                        <div>
                            <label for="rental-client" class="mb-2 block text-sm font-semibold text-slate-700">Pilih Klien</label>
                            <select id="rental-client" name="client_id" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" required>
                                <option value="">Pilih klien</option>
                                @foreach ($clients as $client)
                                    <option value="{{ $client->id }}" @selected(old('client_id') === $client->id)>{{ $client->name }} - {{ $client->city }}</option>
                                @endforeach
                            </select>
                            @error('client_id') <p class="mt-2 text-xs font-medium text-rose-600">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label for="rental-billboard" class="mb-2 block text-sm font-semibold text-slate-700">Pilih Billboard</label>
                            <select id="rental-billboard" name="billboard_id" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" required>
                                <option value="">Pilih billboard</option>
                                @foreach ($billboards as $billboard)
                                    <option value="{{ $billboard->id }}" @selected(old('billboard_id') === $billboard->id)>{{ $billboard->name }} - {{ $billboard->city }}</option>
                                @endforeach
                            </select>
                            @error('billboard_id') <p class="mt-2 text-xs font-medium text-rose-600">{{ $message }}</p> @enderror
                        </div>
                    </div>

                    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label for="rental-date" class="mb-2 block text-sm font-semibold text-slate-700">Tanggal Sewa</label>
                            <input id="rental-date" name="rental_date" type="date" value="{{ old('rental_date') }}" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" required>
                            @error('rental_date') <p class="mt-2 text-xs font-medium text-rose-600">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label for="rental-duration" class="mb-2 block text-sm font-semibold text-slate-700">Durasi (hari)</label>
                            <input id="rental-duration" name="duration_days" type="number" min="1" value="{{ old('duration_days') }}" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="30" required>
                            @error('duration_days') <p class="mt-2 text-xs font-medium text-rose-600">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label for="rental-price" class="mb-2 block text-sm font-semibold text-slate-700">Total Harga</label>
                            <input id="rental-price" name="total_price" type="number" min="0" value="{{ old('total_price') }}" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="75000000" required>
                            @error('total_price') <p class="mt-2 text-xs font-medium text-rose-600">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label for="rental-payment-status" class="mb-2 block text-sm font-semibold text-slate-700">Status Pembayaran</label>
                            <select id="rental-payment-status" name="payment_status" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" required>
                                <option value="Pending" @selected(old('payment_status', 'Pending') === 'Pending')>Pending</option>
                                <option value="Paid" @selected(old('payment_status') === 'Paid')>Paid</option>
                                <option value="Overdue" @selected(old('payment_status') === 'Overdue')>Overdue</option>
                            </select>
                            @error('payment_status') <p class="mt-2 text-xs font-medium text-rose-600">{{ $message }}</p> @enderror
                        </div>
                    </div>

                    <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Tips: durasi otomatis dihitung ke tanggal selesai oleh sistem.
                    </div>

                    <div class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                        <button type="button" data-close-rental-modal class="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Batal</button>
                        <button type="submit" class="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800">
                            Simpan Penyewaan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </section>
@endsection

@push('scripts')
    <script>
        function initializeRentalModal() {
            const page = document.getElementById('rental-page');
            const modal = document.getElementById('rental-modal');
            const form = document.getElementById('rental-form');
            const title = document.getElementById('rental-modal-title');
            const methodInput = document.getElementById('rental-form-method');
            const modeInput = document.getElementById('rental-form-mode');
            const recordIdInput = document.getElementById('rental-record-id');
            
            if (!page || !modal || !form) return;
            
            const storeAction = page.dataset.storeAction;
            const updateBase = page.dataset.updateBase;
            const openButtons = document.querySelectorAll('[data-open-rental-modal]');
            const closeButtons = document.querySelectorAll('[data-close-rental-modal]');
            const oldMode = @json(old('form_mode'));
            const oldRecordId = @json(old('record_id'));
            const oldRental = {
                id: @json(old('record_id')),
                client_id: @json(old('client_id', '')),
                billboard_id: @json(old('billboard_id', '')),
                rental_date: @json(old('rental_date', '')),
                duration_days: @json(old('duration_days', '')),
                total_price: @json(old('total_price', '')),
                payment_status: @json(old('payment_status', 'Pending')),
            };

            const inputMap = {
                client_id: form.querySelector('#rental-client'),
                billboard_id: form.querySelector('#rental-billboard'),
                rental_date: form.querySelector('#rental-date'),
                duration_days: form.querySelector('#rental-duration'),
                total_price: form.querySelector('#rental-price'),
                payment_status: form.querySelector('#rental-payment-status'),
            };

            const openModal = (mode, rental = {}) => {
                form.reset();
                form.action = storeAction;
                methodInput.value = 'POST';
                modeInput.value = 'create';
                recordIdInput.value = '';
                title.textContent = 'Tambah Penyewaan';

                if (mode === 'edit') {
                    form.action = `${updateBase}/${rental.id}`;
                    methodInput.value = 'PUT';
                    modeInput.value = 'edit';
                    recordIdInput.value = rental.id || '';
                    title.textContent = 'Edit Penyewaan';
                }

                inputMap.client_id.value = rental.client_id || '';
                inputMap.billboard_id.value = rental.billboard_id || '';
                inputMap.rental_date.value = rental.rental_date || '';
                inputMap.duration_days.value = rental.duration_days || '';
                inputMap.total_price.value = rental.total_price || '';
                inputMap.payment_status.value = rental.payment_status || 'Pending';

                modal.classList.remove('hidden');
                modal.classList.add('flex');
            };

            const closeModal = () => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            };

            openButtons.forEach((button) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const mode = button.dataset.openRentalModal;
                    const rental = {
                        id: button.dataset.rentalId || '',
                        booking_code: button.dataset.rentalBookingCode || '',
                        client_id: button.dataset.rentalClientId || '',
                        billboard_id: button.dataset.rentalBillboardId || '',
                        rental_date: button.dataset.rentalDate || '',
                        duration_days: button.dataset.rentalDurationDays || '',
                        total_price: button.dataset.rentalTotalPrice || '',
                        payment_status: button.dataset.rentalPaymentStatus || 'Pending',
                    };
                    openModal(mode, rental);
                });
            });

            closeButtons.forEach((button) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    closeModal();
                });
            });
            
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                }
            });
            
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    closeModal();
                }
            });

            if (@json($errors->any())) {
                openModal(oldMode === 'edit' ? 'edit' : 'create', oldRental);
                if (oldMode === 'edit' && oldRecordId) {
                    form.action = `${updateBase}/${oldRecordId}`;
                    methodInput.value = 'PUT';
                    modeInput.value = 'edit';
                    recordIdInput.value = oldRecordId;
                }
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeRentalModal);
        } else {
            initializeRentalModal();
        }
    </script>
@endpush
