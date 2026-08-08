# Convenience wrapper — the C CLI lives in c-engine/
.PHONY: all release clean

all release clean:
	$(MAKE) -C c-engine $@
