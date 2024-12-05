<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Firestore;

class CheckFirebaseAdmin
{
    protected $firestore;

    public function __construct(Firestore $firestore)
    {
        $this->firestore = $firestore;
    }

    public function handle(Request $request, Closure $next)
    {
        try {
            $uid = $request->attributes->get('firebase_uid');
            
            if (!$uid) {
                return response()->json(['message' => 'Usuário não autenticado'], 401);
            }

            // Busca o documento do usuário no Firestore
            $userDoc = $this->firestore->database()->collection('users')->document($uid)->snapshot();

            if (!$userDoc->exists()) {
                return response()->json(['message' => 'Usuário não encontrado'], 404);
            }

            $userData = $userDoc->data();

            if (!isset($userData['tipo']) || $userData['tipo'] !== 'admin') {
                return response()->json(['message' => 'Acesso não autorizado. Apenas administradores podem acessar este recurso.'], 403);
            }

            return $next($request);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao verificar permissões de administrador'], 500);
        }
    }
}
