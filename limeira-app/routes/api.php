<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CnpjController;

// Rota pública para verificação de CNPJ (temporariamente sem autenticação para teste)
Route::get('/cnpj/{cnpj}', [CnpjController::class, 'verifyCNPJ']);

// Rotas públicas de autenticação
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rotas públicas
Route::get('/businesses', [BusinessController::class, 'index']);
Route::get('/businesses/{id}', [BusinessController::class, 'show']);

// Rotas que precisam de autenticação
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::post('/businesses', [BusinessController::class, 'store']);
    Route::put('/businesses/{id}', [BusinessController::class, 'update']);
    Route::delete('/businesses/{id}', [BusinessController::class, 'destroy']);
    Route::get('/user/businesses', [BusinessController::class, 'userBusinesses']);
});

// Rotas de admin
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::get('/admin/businesses', [AdminController::class, 'businesses']);
    Route::post('/admin/approve-business/{id}', [AdminController::class, 'approveBusiness']);
    Route::delete('/admin/delete-business/{id}', [AdminController::class, 'deleteBusiness']);
});
