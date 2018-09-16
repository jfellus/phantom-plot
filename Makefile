install:
	mkdir -p /usr/lib/phantom-plot
	cp ./* /usr/lib/phantom-plot
	ln -s /usr/lib/phantom-plot/phantom-plot /usr/bin/phantom-plot
