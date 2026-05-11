<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Expense::with('driver', 'conductor')->get()], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_id' => 'required|integer',
            'driver_id'   => 'required|exists:crews,id',
            'conductor_id' => 'required|exists:crews,id',
            'amount'      => 'required|numeric|min:0',
            'type'        => 'required|in:toll payments,crew consumption,fuel,repair,accident',
            'details'     => 'required|string',
            'datetime'    => 'required|date'
        ]);
        $expense = Expense::create($validated);
        return response()->json(['message' => 'Pengeluaran berhasil dicatat', 'data' => $expense], 201);
    }

    public function show($id)
    {
        $expense = Expense::with('driver', 'conductor')->find($id);
        if (!$expense) {
            return response()->json(['error' => 'Data pengeluaran tidak ditemukan'], 404);
        }
        return response()->json(['data' => $expense], 200);
    }

    public function update(Request $request, $id)
    {
        $expense = Expense::find($id);
        if (!$expense) {
            return response()->json(['error' => 'Data pengeluaran tidak ditemukan'], 404);
        }
        $validated = $request->validate([
            'schedule_id' => 'sometimes|required|integer',
            'driver_id'   => 'sometimes|required|exists:crews,id',
            'conductor_id' => 'sometimes|required|exists:crews,id',
            'amount'      => 'sometimes|required|numeric|min:0',
            'type'        => 'sometimes|required|in:toll payments,crew consumption,fuel,repair,accident',
            'details'     => 'sometimes|required|string',
            'datetime'    => 'sometimes|required|date'
        ]);
        $expense->update($validated);
        return response()->json(['message' => 'Pengeluaran berhasil diperbarui', 'data' => $expense], 200);
    }

    public function destroy($id)
    {
        $expense = Expense::find($id);
        if (!$expense) {
            return response()->json(['error' => 'Data pengeluaran tidak ditemukan'], 404);
        }
        $expense->delete();
        return response()->json(['message' => 'Pengeluaran berhasil dihapus'], 200);
    }
}
