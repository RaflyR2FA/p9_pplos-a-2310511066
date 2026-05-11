<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Crew extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'role',
    ];

    public function driverExpenses()
    {
        return $this->hasMany(Expense::class, 'driver_id');
    }

    public function conductorExpenses()
    {
        return $this->hasMany(Expense::class, 'conductor_id');
    }
}
