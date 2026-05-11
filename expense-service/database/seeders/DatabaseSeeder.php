<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Crew;
use App\Models\Expense;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $supir1 = Crew::create([
            'name' => 'Budi Santoso',
            'role' => 'Driver'
        ]);

        $konduktor1 = Crew::create([
            'name' => 'Agus Setiawan',
            'role' => 'Conductor'
        ]);

        $supir2 = Crew::create([
            'name' => 'Joko Purwanto',
            'role' => 'Driver'
        ]);

        $konduktor2 = Crew::create([
            'name' => 'Fajar Pratama',
            'role' => 'Conductor'
        ]);

        Expense::create([
            'schedule_id' => 1,
            'driver_id'   => $supir1->id,
            'conductor_id' => $konduktor1->id,
            'amount'      => 150000.00,
            'type'        => 'Toll payments',
            'details'     => 'Pembayaran gerbang tol Cipali',
            'datetime'    => Carbon::now()->subHours(10)
        ]);

        Expense::create([
            'schedule_id' => 1,
            'driver_id'   => $supir1->id,
            'conductor_id' => $konduktor1->id,
            'amount'      => 50000.00,
            'type'        => 'Crew consumption',
            'details'     => 'Makan malam kru di rest area KM 102',
            'datetime'    => Carbon::now()->subHours(8)
        ]);

        Expense::create([
            'schedule_id' => 2,
            'driver_id'   => $supir2->id,
            'conductor_id' => $konduktor2->id,
            'amount'      => 850000.00,
            'type'        => 'Fuel',
            'details'     => 'Isi solar penuh di SPBU Semarang',
            'datetime'    => Carbon::now()->subHours(2)
        ]);
    }
}
