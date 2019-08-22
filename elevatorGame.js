{
    init: function (elevators, floors) {
        elevators.forEach(function(elevator, index) {
            elevator.removeFloorFromQueue = function(floorNum){
                this.destinationQueue = this.destinationQueue.filter((floor) => floor !== floorNum);
                this.checkDestinationQueue();
            }

            elevator.goToFloorWithUpdate = function(floorNum, force){
                elevator.removeFloorFromQueue(floorNum);
                elevator.goToFloor(floorNum, force);
                elevator.updateDirection(floorNum);
            }

            elevator.updateDirection = function(floorNum){
                if(floorNum === this.currentFloor())
                    return;

                if(floorNum > this.currentFloor()){
                    this.goingDownIndicator(false);
                    this.goingUpIndicator(true);
                }else{
                    this.goingDownIndicator(true);
                    this.goingUpIndicator(false);
                }
            }

            elevator.index = index;
            elevator.on("floor_button_pressed", function(floorNum) {
                console.log('----------------------')
                logElevator(elevator);
                console.log(`Someone just pressed the ${floorNum} button. Going there.` );
                console.log('----------------------')
                elevator.goToFloorWithUpdate(floorNum);
            });

            elevator.on("passing_floor", function(floorNum, direction) {
                if(elevator.getPressedFloors().indexOf(floorNum) !== -1){
                    console.log('----------------------')
                    logElevator(elevator);
                    console.log(`Passing floor ${floorNum} and someone selected the floor. Stopping here.` );
                    console.log('----------------------')
                    elevator.goToFloorWithUpdate(floorNum, true);
                    return;
                }

                if(elevator.loadFactor() === 1)
                    return;

                if(direction === "up" && upIndicatorFloors.indexOf(floorNum) !== -1) {
                    console.log('----------------------')
                    logElevator(elevator);
                    console.log(`Passing floor ${floorNum} and wants to go up. Stopping here.`);
                    console.log('----------------------')
                    elevator.goToFloorWithUpdate(floorNum, true);
                    upIndicatorFloors = removeFloor(floorNum, upIndicatorFloors);
                }

                if(direction === "down" && dowmIndicatorFloors.indexOf(floorNum) !== -1) {
                    console.log('----------------------')
                    logElevator(elevator);
                    console.log(`Passing floor ${floorNum} and wants to go down. Stopping here.`);
                    console.log('----------------------')
                    elevator.goToFloorWithUpdate(floorNum, true);
                    dowmIndicatorFloors = removeFloor(floorNum, dowmIndicatorFloors);
                }
            });

            elevator.on("stopped_at_floor", function(floorNum) {
                elevator.removeFloorFromQueue(floorNum);

                if (floorNum == floors.length - 1){
                    this.goingDownIndicator(true);
                    this.goingUpIndicator(false);
                }

                if (floorNum == 0){
                    this.goingDownIndicator(false);
                    this.goingUpIndicator(true);
                }

                if(elevator.getPressedFloors().length == 0){
                    this.goingDownIndicator(true);
                    this.goingUpIndicator(true);
                }
            });

            // Whenever the elevator is idle (has no more queued destinations) ...
            elevator.on("idle", function() {
                sendIdleElevator(elevator);
            });    
        });  

        var sendIdleElevator = function(elevator){
            if(elevator == null)
                return;

            var closestActiveFloor = upIndicatorFloors.concat(dowmIndicatorFloors)
                .map((x) => ({floor: x, diff:Math.abs(floors.length - x)}))
                .sort((a,b) => a.diff - b.diff)[0];

            console.log("elevator is idle with active floors " + closestActiveFloor);
            console.log(logElevator(elevator))

            if(!closestActiveFloor){
                elevator.goingDownIndicator(true);
                elevator.goingUpIndicator(true);
                idleElevators.push(elevator);
                return;
            }

            upIndicatorFloors = removeFloor(closestActiveFloor.floor, upIndicatorFloors);
            dowmIndicatorFloors = removeFloor(closestActiveFloor.floor, dowmIndicatorFloors);
            elevator.goToFloorWithUpdate(closestActiveFloor.floor);
        }

        var upIndicatorFloors = [];
        var dowmIndicatorFloors = [];
        var idleElevators = [];

        floors.forEach(function(floor){
            floor.on("up_button_pressed", function() {
                upIndicatorFloors.push(floor.floorNum());
                sendIdleElevator(idleElevators.pop());
            });

            floor.on("down_button_pressed", function() {
                dowmIndicatorFloors.push(floor.floorNum());
                sendIdleElevator(idleElevators.pop());
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
    update: function (dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}