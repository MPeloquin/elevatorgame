{
    init: function(elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator

        elevators.forEach(function(elevator, index){
            elevator.removeFloorFromQueue = function(floorNum){
                this.destinationQueue = this.destinationQueue.filter((floor) => floor !== floorNum);
                this.checkDestinationQueue();
            }

            elevator.index = index;
            elevator.on("floor_button_pressed", function(floorNum) {
                if(floorNum < elevator.currentFloor()){
                //    elevator.goingDownIndicator(true);
                //    elevator.goingUpIndicator(false);
                }else if (floorNum > elevator.currentFloor()){
                //    elevator.goingDownIndicator(false);
                //    elevator.goingUpIndicator(true);
                }
                console.log('----------------------')
                logElevator(elevator);
                console.log(`Someone just pressed the ${floorNum} button. Stopping here.` );
                console.log('----------------------')
                elevator.removeFloorFromQueue(floorNum);
                elevator.goToFloor(floorNum);
            });

            elevator.on("passing_floor", function(floorNum, direction) {
                if(elevator.loadFactor() === 1)
                    return;

                if(elevator.getPressedFloors().indexOf(floorNum) !== -1){
                    console.log('----------------------')
                    logElevator(elevator);
                    console.log(`Passing floor ${floorNum} and someone selected the floor. Stopping here.` );
                    console.log('----------------------')
                    elevator.removeFloorFromQueue(floorNum);
                    elevator.goToFloor(floorNum, true);
                    return;
                }

                if(direction === "up" && upIndicatorFloors.indexOf(floorNum) !== -1) {
                    console.log('----------------------')
                    logElevator(elevator);
                    console.log(`Passing floor ${floorNum} and wants to go up. Stopping here. ${elevator}`);
                    console.log('----------------------')
                    elevator.removeFloorFromQueue(floorNum);
                    elevator.goToFloor(floorNum, true);
                    upIndicatorFloors = removeFloor(floorNum, upIndicatorFloors);
                }

                if(direction === "down" && dowmIndicatorFloors.indexOf(floorNum) !== -1) {
                    console.log('----------------------')
                    logElevator(elevator);
                    console.log(`Passing floor ${floorNum} and wants to go down. Stopping here. ${elevator}`);
                    console.log('----------------------')
                    elevator.removeFloorFromQueue(floorNum);
                    elevator.goToFloor(floorNum, true);
                    dowmIndicatorFloors = removeFloor(floorNum, dowmIndicatorFloors);
                }
            });

            elevator.on("stopped_at_floor", function(floorNum) {
                elevator.removeFloorFromQueue(floorNum);
            });

            // Whenever the elevator is idle (has no more queued destinations) ...
            elevator.on("idle", function() {
                var closestActiveFloor = upIndicatorFloors.concat(dowmIndicatorFloors)
                                    .map((x) => ({floor: x, diff:Math.abs(7 - x)}))
                                    .sort((a,b) => a.diff - b.diff)[0];

                if(!closestActiveFloor){
                    return;
                }

                upIndicatorFloors = removeFloor(closestActiveFloor.floor, upIndicatorFloors);
                dowmIndicatorFloors = removeFloor(closestActiveFloor.floor, dowmIndicatorFloors);
                elevator.goToFloor(closestActiveFloor.floor);
            });    
        });  

        var upIndicatorFloors = [];
        var dowmIndicatorFloors = [];

        floors.forEach(function(floor){
            floor.on("up_button_pressed", function() {
                upIndicatorFloors.push(floor.floorNum());
            });

            floor.on("down_button_pressed", function() {
                dowmIndicatorFloors.push(floor.floorNum());
            });
        });

        var removeFloor = function(floorNum, floors){
            return floors.filter(floor => floor !== floorNum);
        }

        var logElevator = function(elevator){
            console.log(JSON.parse(JSON.stringify({
                index: elevator.index,
                currentFloor: elevator.currentFloor(),
                goingUpIndicator: elevator.goingUpIndicator(),
                goingDownIndicator: elevator.goingDownIndicator(),
                maxPassengerCount: elevator.maxPassengerCount(),
                loadFactor: elevator.loadFactor(),
                destinationDirection: elevator.destinationDirection(),
                destinationQueue: elevator.destinationQueue,
                getPressedFloors: elevator.getPressedFloors(),
                downIndicatorFloors: dowmIndicatorFloors,
                upIndicatorFloors: upIndicatorFloors
            })));
        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}