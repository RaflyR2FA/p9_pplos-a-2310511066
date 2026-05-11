<?php

use App\Http\Controllers\ExpenseController;
use Illuminate\Support\Facades\Route;

Route::get('expenses', [ExpenseController::class, 'index']);
Route::post('expenses', [ExpenseController::class, 'store']);
Route::get('expenses/{id}', [ExpenseController::class, 'show']);
Route::put('expenses/{id}', [ExpenseController::class, 'update']);
Route::delete('expenses/{id}', [ExpenseController::class, 'destroy']);
