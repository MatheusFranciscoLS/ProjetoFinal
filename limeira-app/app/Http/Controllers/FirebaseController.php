<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Firestore;

class FirebaseController extends Controller
{
    protected $firestore;

    public function __construct(Firestore $firestore)
    {
        $this->firestore = $firestore;
    }

    public function listarUsuarios()
    {
        $collection = $this->firestore->database()->collection('usuarios_solidarios');
        $documents = $collection->documents();
        $usuarios = [];

        foreach ($documents as $document) {
            $usuarios[] = $document->data();
        }

        return response()->json($usuarios);
    }
}
