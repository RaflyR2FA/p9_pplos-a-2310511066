<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'driver_id',
        'conductor_id',
        'amount',
        'type',
        'details',
        'datetime',
    ];

    protected $casts = [
        'datetime' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(Crew::class, 'driver_id');
    }

    public function conductor()
    {
        return $this->belongsTo(Crew::class, 'conductor_id');
    }
}
