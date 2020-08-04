import os

script_dir = os.path.dirname(__file__) # absolute dir the script is in
ready_file = os.path.join(script_dir, "ready.js")
base_file =  os.path.join(script_dir, "base.js")
init_file =  os.path.join(script_dir, "init.js")

# Create a fresh "ready.js" by writing a new file
with open(ready_file, 'w') as ready:
    ready.write("")

# Put the init and update functions in the base file and append it all to ready_file
with open(ready_file, 'a') as ready:
    with open(base_file) as base:
        # Write the first 2 lines
        for x in range(2):
            ready.write(base.readline())
        # Add the init function
        with open(init_file) as init:
            for line in init:
                ready.write("        " + line)
        # Add the rest of the base file
        for x in range(6):
            ready.write(base.readline())
