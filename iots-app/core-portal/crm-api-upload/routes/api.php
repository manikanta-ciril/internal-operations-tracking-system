<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    $token = $request->user()->currentAccessToken();
    abort_if($token && (in_array('leads:read', $token->abilities ?? [], true) || in_array('crm:read', $token->abilities ?? [], true))
        && !in_array('*', $token->abilities ?? [], true), 403, 'This token can read leads only.');
    return $request->user();
});

// Read-only leads integration; existing web login remains unchanged.
Route::prefix('integration/v1')->middleware([
    'auth:sanctum',
    \App\Http\Middleware\RequireLeadIntegration::class,
    'throttle:30,1',
])->group(function () {
    Route::get('/resources', [\App\Http\Controllers\Integration\LeadController::class, 'resources']);
    Route::get('/resources/{resource}', [\App\Http\Controllers\Integration\LeadController::class, 'resources']);
    Route::get('/leads', [\App\Http\Controllers\Integration\LeadController::class, 'index'])->name('integration.leads.index');
    Route::get('/leads/{id}', [\App\Http\Controllers\Integration\LeadController::class, 'show'])->whereNumber('id')->name('integration.leads.show');
});
