{
    init: function(elevators, floors) {
        // Initialize "waiting for elevator" up and down requests
        var waitingUp = new Set();
        var waitingDown = new Set();
        // Initialize Up and Down request buttons for each floor so they populate {waiting} sets
        addWaitingRequests(floors);
        
        // Initialize each elevator
        for (let [i, elevator] of elevators.entries()) {
            elevator.id = `E-${i + 1}`; // give it an id so we know what to call it
            elevator.goingDownIndicator(false); // We start on floor 0 so prepare to go up
            // add the functions below to each elevator
            onIdle(elevator, floors);
            elevatorPassingFloor(elevator);
            requestMade(elevator);
            arrived(elevator, floors);
        }
        
        // Initializations completed - Define functions
        
        // When an elevator is idle decide what to do
        function onIdle(elevator, floors) {
            elevator.on("idle", () => {
                console.log(elevator.id, "is IDLE");
        
                const idleTimer = setInterval(() => {
                    // Look for anyone going down and go get the highest one
                    if (waitingDown.size != 0) {
                        console.log(elevator.id, "picking up", Math.max(...waitingDown));
                        elevator.goToFloor(Math.max(...waitingDown));
                        elevator.goingUpIndicator(false);
                        elevator.goingDownIndicator(true);
                        clearInterval(idleTimer);
                    // Otherwise look for the lowest person going up (usually the bottom floor)
                    } else if (waitingUp.size != 0) {
                        console.log(elevator.id, "picking up", Math.min(...waitingUp));
                        elevator.goToFloor(Math.min(...waitingUp));
                        elevator.goingUpIndicator(true);
                        elevator.goingDownIndicator(false);
                        clearInterval(idleTimer);
                    }
                }, 100);
            });
        }
        
        // When an elevator is approaching a floor decide whether to stop or not
        function elevatorPassingFloor(elevator) {
            elevator.on("passing_floor", function (floorNum, direction) {
                // if floor request in same direction and not full
                if (elevator.goingUpIndicator() && waitingUp.has(floorNum) && elevator.loadFactor() < 0.5) {
                    elevator.goToFloor(floorNum, true);
                }
                if (
                    elevator.goingDownIndicator() &&
                    waitingDown.has(floorNum) &&
                    elevator.loadFactor() < 0.5
                ) {
                    elevator.goToFloor(floorNum, true);
                }
            });
        }
        
        // When people waiting for elevators press up and down buttons populate the {waiting} sets
        function addWaitingRequests(floors) {
            for (let floor of floors) {
                floor.on("up_button_pressed", function () {
                    waitingUp.add(floor.floorNum());
                });
                floor.on("down_button_pressed", function () {
                    waitingDown.add(floor.floorNum());
                });
            }
        }
        
        // When people press floor buttons on the elevator
        function requestMade(elevator) {
            elevator.on("floor_button_pressed", function (floorNum) {
                // When floors are requested sort them according to the direction we are going
                elevator.goToFloor(floorNum);
        
                // if going up sort ascending
                if (elevator.goingUpIndicator()) {
                    elevator.destinationQueue.sort((a, b) => a - b);
                }
                // if going down sort descending
                if (elevator.goingDownIndicator()) {
                    elevator.destinationQueue.sort((a, b) => b - a);
                }
                // check queue after sorting
                elevator.checkDestinationQueue();
            });
        }
        
        // When an elevator arrives on any particular floor decide what to do
        function arrived(elevator, floors) {
            elevator.on("stopped_at_floor", function (floorNum) {
                // if bottom floor switch indicators and go up
                if (floorNum === 0) {
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(false);
                    return;
                    // If top floor switch indicators and go down
                } else if (floorNum === floors.length - 1) {
                    elevator.goingUpIndicator(false);
                    elevator.goingDownIndicator(true);
                }
        
                // Clear corresponding up/down requests
                // We assume we pick up all the relevant passengers. If not they just hit the button again.
                if (elevator.goingUpIndicator()) {
                    waitingUp.delete(elevator.currentFloor());
                }
                if (elevator.goingDownIndicator()) {
                    waitingDown.delete(elevator.currentFloor());
                }
            });
        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
