<?php

namespace App\Http\Controllers\Web\Universal;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LocaleController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => 'required|string|in:es,en',
        ]);

        $request->session()->put('locale', $validated['locale']);

        Log::info('Locale updated to: '.$validated['locale']);

        return back();
    }
}
