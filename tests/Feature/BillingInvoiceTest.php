<?php

use App\Http\Controllers\Web\Central\BillingController;
use App\Models\Central\User;
use Illuminate\Http\Request;
use Laravel\Cashier\Invoice;
use Stripe\Invoice as StripeInvoice;

use function Pest\Laravel\mock;

test('invoice downloads redirect to Stripe hosted PDFs without a local renderer', function () {
    $user = User::factory()->create();
    $user->forceFill(['stripe_id' => 'cus_test_maestro'])->save();
    $billableUser = mock(User::class)->makePartial();
    $billableUser->setRawAttributes($user->getAttributes(), true);
    $billableUser->exists = true;
    $stripeInvoice = StripeInvoice::constructFrom([
        'id' => 'in_test_maestro',
        'customer' => 'cus_test_maestro',
        'invoice_pdf' => 'https://pay.stripe.com/invoices/in_test_maestro.pdf',
    ]);
    $invoice = new Invoice($user, $stripeInvoice);
    $billableUser->shouldReceive('findInvoiceOrFail')
        ->once()
        ->with('in_test_maestro')
        ->andReturn($invoice);

    $request = Request::create('/billing/invoices/in_test_maestro');
    $request->setUserResolver(fn () => $billableUser);

    $response = app(BillingController::class)->downloadInvoice($request, 'in_test_maestro');

    expect($response->getTargetUrl())
        ->toBe('https://pay.stripe.com/invoices/in_test_maestro.pdf');
});
