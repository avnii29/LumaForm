# LumaForm — terminal CLI
CC     = gcc
CFLAGS = -Wall -Wextra -std=c99 -Iinclude
LIBS   = -lm

SRCS = $(wildcard src/*.c)
OBJS = $(patsubst src/%.c, build/%.o, $(SRCS))
TARGET = build/img2ascii

all: $(TARGET)

$(TARGET): $(OBJS)
	@mkdir -p build
	$(CC) $(CFLAGS) -o $@ $^ $(LIBS)

build/%.o: src/%.c
	@mkdir -p build
	$(CC) $(CFLAGS) -c $< -o $@

release: CFLAGS += -O2
release: $(TARGET)

clean:
	rm -rf build

.PHONY: all release clean
