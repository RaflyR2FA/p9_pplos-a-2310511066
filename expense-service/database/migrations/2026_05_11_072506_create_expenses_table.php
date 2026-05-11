<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('schedule_id');
            $table->foreignId('driver_id')->constrained('crews');
            $table->foreignId('conductor_id')->constrained('crews');
            $table->decimal('amount', 12, 2);
            $table->enum('type', ['Toll payments', 'Crew consumption', 'Fuel', 'Repair', 'Accident', 'Other']);
            $table->text('details');
            $table->dateTime('datetime');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
