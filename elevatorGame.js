{
    init: function(elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator

        elevators.forEach(function(elevator){
            elevator.on("floor_button_pressed", function(floorNum) {
                if(floorNum < elevator.currentFloor()){
                    elevator.goingDownIndicator(true);
                    elevator.goingUpIndicator(false);
                }else if (floorNum > elevator.currentFloor()){
                    elevator.goingDownIndicator(false);
                    elevator.goingUpIndicator(true);
                }

                elevator.goToFloor(floorNum);
            });

            elevator.on("passing_floor", function(floorNum, direction) {

            });

            // Whenever the elevator is idle (has no more queued destinations) ...
            elevator.on("idle", function() {
                // elevator.goToFloor(2);
            });    
        });  



        floors.forEach(function(floor){
            floor.on("up_button_pressed", function() {
                // closestElevator(floor.level, true).goToFloor(floor.floorNum());
            });

            floor.on("down_button_pressed", function() {
                //  closestElevator(floor.level, false).goToFloor(floor.floorNum());
            });
        });

        var closestElevator = function(floor, goingUp){

        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}