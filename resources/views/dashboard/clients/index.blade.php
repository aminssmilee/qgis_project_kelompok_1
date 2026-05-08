@extends('layouts.dashboard', ['title' => 'Manajemen Klien'])

@section('content')
    <section id="client-page" data-store-action="{{ route('dashboard.clients.store') }}" data-update-base="{{ url('/dashboard/clients') }}" class="space-y-6">
        @php
            $formMode = old('form_mode', 'create');
            $recordId = old('record_id', '');
        @endphp

        <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p class="text-sm font-medium text-slate-500">Total Klien</p>
                <p class="mt-2 text-3xl font-semibold text-slate-900">{{ $totalClients }}</p>
            </div>
            <div class="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                <p class="text-sm font-medium text-emerald-700">Klien Active</p>
                <p class="mt-2 text-3xl font-semibold text-emerald-700">{{ $activeClients }}</p>
            </div>
            <div class="rounded-3xl border border-slate-200 bg-slate-100 p-6 shadow-sm">
                <p class="text-sm font-medium text-slate-600">Klien Inactive</p>
                <p class="mt-2 text-3xl font-semibold text-slate-900">{{ $inactiveClients }}</p>
            </div>
        </div>

        <div class="rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div class="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Klien</p>
                    <div class="mt-1 flex flex-wrap items-center gap-3">
                        <h2 class="text-2xl font-semibold text-slate-900">Daftar Klien</h2>
                        <span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{{ $clients->count() }} data</span>
                    </div>
                    <p class="mt-2 text-sm text-slate-500">Kelola data klien untuk proses pemesanan dan penyewaan billboard.</p>
                </div>
                <button type="button" data-open-client-modal="create" class="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 whitespace-nowrap">
                    + Tambah Klien
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nama Klien</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Kontak</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Kota</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</th>
                            <th class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        @forelse ($clients as $client)
                            <tr class="transition hover:bg-slate-50">
                                <td class="px-6 py-5 align-top">
                                    <div class="font-semibold text-slate-900">{{ $client->name }}</div>
                                    <div class="mt-1 text-xs text-slate-500">Bergabung {{ optional($client->created_at)->format('d M Y') }}</div>
                                </td>
                                <td class="px-6 py-5 align-top">
                                    <div class="space-y-1 text-sm text-slate-700">
                                        <div>{{ $client->email }}</div>
                                        <div>{{ $client->phone }}</div>
                                    </div>
                                </td>
                                <td class="px-6 py-5 align-top text-sm text-slate-700">{{ $client->city }}</td>
                                <td class="px-6 py-5 align-top">
                                    @if ($client->status === 'Active')
                                        <span class="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
                                    @else
                                        <span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Inactive</span>
                                    @endif
                                </td>
                                <td class="px-6 py-5 align-top text-right">
                                    <div class="flex justify-end gap-2 whitespace-nowrap">
                                        <button
                                            type="button"
                                            data-open-client-modal="edit"
                                            data-client-id="{{ $client->id }}"
                                            data-client-name="{{ $client->name }}"
                                            data-client-email="{{ $client->email }}"
                                            data-client-phone="{{ $client->phone }}"
                                            data-client-city="{{ $client->city }}"
                                            data-client-status="{{ $client->status }}"
                                            class="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                                        >
                                            Edit
                                        </button>
                                        <form action="{{ route('dashboard.clients.destroy', $client) }}" method="POST" onsubmit="return confirm('Hapus klien ini?');">
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
                                <td colspan="5" class="px-6 py-16 text-center text-sm text-slate-500">
                                    <div class="mx-auto flex max-w-md flex-col items-center gap-4">
                                        <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 1-3 .372c-4.97 0-9-3.134-9-7s4.03-7 9-7 9 3.134 9 7a6.97 6.97 0 0 1-1.17 3.824L21 19.5l-3.28-.874A9.06 9.06 0 0 1 15 19.128Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-base font-semibold text-slate-700">Belum ada data klien</p>
                                            <p class="mt-1 text-sm text-slate-500">Tambahkan klien pertama agar proses penyewaan bisa langsung berjalan.</p>
                                        </div>
                                        <button type="button" data-open-client-modal="create" class="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                                            + Tambah Klien Pertama
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <div id="client-modal" class="fixed inset-0 z-50 hidden items-center justify-center px-4 py-6">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" data-close-client-modal></div>
            <div class="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-900/20">
                <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">Form Klien</p>
                        <h3 id="client-modal-title" class="mt-1 text-xl font-semibold text-slate-900">Tambah Klien</h3>
                    </div>
                    <button type="button" data-close-client-modal class="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                        ×
                    </button>
                </div>

                <form id="client-form" method="POST" action="{{ route('dashboard.clients.store') }}" class="flex-1 space-y-4 overflow-y-auto p-6">
                    @csrf
                    <input type="hidden" name="_method" id="client-form-method" value="POST">
                    <input type="hidden" name="form_mode" id="client-form-mode" value="{{ old('form_mode', 'create') }}">
                    <input type="hidden" name="record_id" id="client-record-id" value="{{ old('record_id') }}">

                    <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label for="client-name" class="mb-2 block text-sm font-semibold text-slate-700">Nama Klien</label>
                            <input id="client-name" name="name" type="text" value="{{ old('name') }}" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Contoh: PT Maju Jaya" required>
                            @error('name') <p class="mt-2 text-xs font-medium text-rose-600">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label for="client-email" class="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                            <input id="client-email" name="email" type="email" value="{{ old('email') }}" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="email@perusahaan.com" required>
                            @error('email') <p class="mt-2 text-xs font-medium text-rose-600">{{ $message }}</p> @enderror
                        </div>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label for="client-phone" class="mb-2 block text-sm font-semibold text-slate-700">Nomor Telepon</label>
                            <input id="client-phone" name="phone" type="text" value="{{ old('phone') }}" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="08xxxxxxxxxx" required>
                            @error('phone') <p class="mt-2 text-xs font-medium text-rose-600">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label for="client-city" class="mb-2 block text-sm font-semibold text-slate-700">Kota</label>
                            <input id="client-city" name="city" type="text" value="{{ old('city') }}" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Lamongan" required>
                            @error('city') <p class="mt-2 text-xs font-medium text-rose-600">{{ $message }}</p> @enderror
                        </div>
                    </div>

                    <div>
                        <label for="client-status" class="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                        <select id="client-status" name="status" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" required>
                            <option value="Active" @selected(old('status', 'Active') === 'Active')>Active</option>
                            <option value="Inactive" @selected(old('status') === 'Inactive')>Inactive</option>
                        </select>
                        @error('status') <p class="mt-2 text-xs font-medium text-rose-600">{{ $message }}</p> @enderror
                    </div>

                    <div class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                        <button type="button" data-close-client-modal class="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Batal</button>
                        <button type="submit" class="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800">
                            Simpan Klien
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </section>
@endsection

@push('scripts')
    <script>
        function initializeClientModal() {
            const page = document.getElementById('client-page');
            const modal = document.getElementById('client-modal');
            const form = document.getElementById('client-form');
            const title = document.getElementById('client-modal-title');
            const methodInput = document.getElementById('client-form-method');
            const modeInput = document.getElementById('client-form-mode');
            const recordIdInput = document.getElementById('client-record-id');
            
            if (!page || !modal || !form) return;
            
            const storeAction = page.dataset.storeAction;
            const updateBase = page.dataset.updateBase;
            const openButtons = document.querySelectorAll('[data-open-client-modal]');
            const closeButtons = document.querySelectorAll('[data-close-client-modal]');
            const oldMode = @json(old('form_mode'));
            const oldRecordId = @json(old('record_id'));
            const oldClient = {
                id: @json(old('record_id')),
                name: @json(old('name', '')),
                email: @json(old('email', '')),
                phone: @json(old('phone', '')),
                city: @json(old('city', '')),
                status: @json(old('status', 'Active')),
            };

            const inputMap = {
                name: form.querySelector('#client-name'),
                email: form.querySelector('#client-email'),
                phone: form.querySelector('#client-phone'),
                city: form.querySelector('#client-city'),
                status: form.querySelector('#client-status'),
            };

            const openModal = (mode, client = {}) => {
                form.reset();
                form.action = storeAction;
                methodInput.value = 'POST';
                modeInput.value = 'create';
                recordIdInput.value = '';
                title.textContent = 'Tambah Klien';

                if (mode === 'edit') {
                    form.action = `${updateBase}/${client.id}`;
                    methodInput.value = 'PUT';
                    modeInput.value = 'edit';
                    recordIdInput.value = client.id || '';
                    title.textContent = 'Edit Klien';
                }

                inputMap.name.value = client.name || '';
                inputMap.email.value = client.email || '';
                inputMap.phone.value = client.phone || '';
                inputMap.city.value = client.city || '';
                inputMap.status.value = client.status || 'Active';

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
                    const mode = button.dataset.openClientModal;
                    const client = {
                        id: button.dataset.clientId || '',
                        name: button.dataset.clientName || '',
                        email: button.dataset.clientEmail || '',
                        phone: button.dataset.clientPhone || '',
                        city: button.dataset.clientCity || '',
                        status: button.dataset.clientStatus || 'Active',
                    };
                    openModal(mode, client);
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
                openModal(oldMode === 'edit' ? 'edit' : 'create', oldClient);
                if (oldMode === 'edit' && oldRecordId) {
                    form.action = `${updateBase}/${oldRecordId}`;
                    methodInput.value = 'PUT';
                    modeInput.value = 'edit';
                    recordIdInput.value = oldRecordId;
                }
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeClientModal);
        } else {
            initializeClientModal();
        }
    </script>
@endpush
