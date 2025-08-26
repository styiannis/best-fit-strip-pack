import {
  bestFitStripPack,
  bestFitStripPackRotatable,
  IBestFitStripPack,
  IDoublyListNode,
} from '../../src/core';

type Rectangle = [number, number];

/* ----------------------------------------- */
/* ---------- // Helper functions ---------- */
/* ----------------------------------------- */

function insertAndConfirm(
  instance: IBestFitStripPack,
  [w, h]: Rectangle,
  expected: { x: number; y: number }
) {
  expect(bestFitStripPack.insert(instance, w, h)).toStrictEqual(expected);
}

function insertAndConfirmRotatable(
  instance: IBestFitStripPack,
  [w, h]: Rectangle,
  expected: { x: number; y: number; rotated: boolean }
) {
  expect(bestFitStripPackRotatable.insert(instance, w, h)).toStrictEqual(
    expected
  );
}

function insertInLineAndConfirm(
  instance: IBestFitStripPack,
  rectangles: Rectangle[]
) {
  rectangles.reduce((totalWidth, [w, h]) => {
    const newPackedHeight = Math.max(instance.packedHeight, h);

    insertAndConfirm(instance, [w, h], { x: totalWidth, y: 0 });

    totalWidth += w;

    expect(instance.packedHeight).toBe(newPackedHeight);
    expect(instance.packedWidth).toBe(totalWidth);

    return totalWidth;
  }, 0);
}

function insertInLineAndConfirmRotatable(
  instance: IBestFitStripPack,
  rectangles: Rectangle[],
  rotated: boolean
) {
  rectangles.reduce((totalWidth, [w, h]) => {
    const newPackedHeight = Math.max(instance.packedHeight, h);

    insertAndConfirmRotatable(instance, [w, h], {
      x: totalWidth,
      y: 0,
      rotated,
    });

    totalWidth += w;

    expect(instance.packedHeight).toBe(newPackedHeight);
    expect(instance.packedWidth).toBe(totalWidth);

    return totalWidth;
  }, 0);
}

function validateListNodeData(
  listNode: IDoublyListNode,
  expected: { x: number; w: number; h: number }
) {
  expect({
    x: listNode.value.x,
    w: listNode.value.width,
    h: listNode.heapNode ? listNode.heapNode.key : Infinity,
  }).toStrictEqual(expected);
}

/* ----------------------------------------- */
/* ---------- Helper functions // ---------- */
/* ----------------------------------------- */

describe('Best-fit positioning', () => {
  describe.each([
    ['bestFitStripPack', bestFitStripPack],
    ['bestFitStripPackRotatable', bestFitStripPackRotatable],
  ] as const)('%s', (instanceType, bfsp) => {
    describe('Action: First node only', () => {
      const stripWidth = 1000;
      const instance = bfsp.create(stripWidth);

      afterEach(() => {
        bfsp.reset(instance);
        expect(instance.packedHeight).toBe(0);
        expect(instance.packedWidth).toBe(0);
        expect(instance.list.size).toBe(0);
        expect(instance.list.head).toBe(null);
        expect(instance.list.tail).toBe(null);
        expect(instance.heap.length).toBe(0);
      });

      it('Split the node', () => {
        const rectangles: Rectangle[] = [
          [200, 20],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 50],
        ];

        const extraRect: [number, number] = [50, 15];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length + 1);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0],
          w: rectangles[1][0],
          h: rectangles[1][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0] + rectangles[1][0],
          w: extraRect[0],
          h: rectangles[2][1] + extraRect[1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0] + rectangles[1][0] + extraRect[0],
          w: rectangles[2][0] - extraRect[0],
          h: rectangles[2][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0] + rectangles[1][0] + rectangles[2][0],
          w: rectangles[3][0],
          h: rectangles[3][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0],
          w: rectangles[4][0],
          h: rectangles[4][1],
        });
      });

      it('Split the node + Merge with the previous node', () => {
        const rectangles: Rectangle[] = [
          [200, 20],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 50],
        ];

        const extraRect: [number, number] = [50, 20];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0],
          w: rectangles[1][0] + extraRect[0],
          h: rectangles[1][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0] + rectangles[1][0] + extraRect[0],
          w: rectangles[2][0] - extraRect[0],
          h: rectangles[2][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0] + rectangles[1][0] + rectangles[2][0],
          w: rectangles[3][0],
          h: rectangles[3][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0],
          w: rectangles[4][0],
          h: rectangles[4][1],
        });
      });

      it('Split the node + Choose placement position based on "x" coordinate', () => {
        const rectangles: Rectangle[] = [
          [100, 90],
          [200, 20],
          [300, 60],
          [200, 20],
          [100, 10],
          [100, 80],
        ];

        const extraRect: [number, number] = [5, 150];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[0][0],
            y: rectangles[1][1],
            rotated: true,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x:
              rectangles[0][0] +
              rectangles[1][0] +
              rectangles[2][0] +
              rectangles[3][0],
            y: rectangles[4][1],
          });
        }
      });

      it('Cover the node', () => {
        const rectangles: Rectangle[] = [
          [200, 20],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 50],
        ];

        const extraRect: [number, number] = [200, 15];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0],
          w: rectangles[1][0],
          h: rectangles[1][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0] + rectangles[1][0],
          w: rectangles[2][0],
          h: rectangles[2][1] + extraRect[1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0] + rectangles[1][0] + rectangles[2][0],
          w: rectangles[3][0],
          h: rectangles[3][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0],
          w: rectangles[4][0],
          h: rectangles[4][1],
        });
      });

      it('Cover the node + Merge with the previous node', () => {
        const rectangles: Rectangle[] = [
          [200, 20],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 50],
        ];

        const extraRect: [number, number] = [200, 20];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length - 1);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0],
          w: rectangles[1][0] + extraRect[0],
          h: rectangles[1][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0] + rectangles[1][0] + rectangles[2][0],
          w: rectangles[3][0],
          h: rectangles[3][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0],
          w: rectangles[4][0],
          h: rectangles[4][1],
        });
      });

      it('Cover the node + Merge with the next node', () => {
        const rectangles: Rectangle[] = [
          [200, 20],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 50],
        ];

        const extraRect: [number, number] = [200, 30];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length - 1);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0],
          w: rectangles[1][0],
          h: rectangles[1][1],
        });

        listNode = listNode.next!;
        validateListNodeData(listNode, {
          x: rectangles[0][0] + rectangles[1][0],
          w: rectangles[2][0] + rectangles[3][0],
          h: rectangles[3][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0],
          w: rectangles[4][0],
          h: rectangles[4][1],
        });
      });

      it('Cover the node + Merge with nodes on both sides', () => {
        const rectangles: Rectangle[] = [
          [200, 20],
          [200, 30],
          [200, 10],
          [200, 30],
          [200, 50],
        ];

        const extraRect: [number, number] = [200, 20];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[1][0] + rectangles[2][0],
            y: rectangles[2][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length - 2);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0],
          w: rectangles[1][0] + rectangles[2][0] + rectangles[3][0],
          h: rectangles[1][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0],
          w: rectangles[4][0],
          h: rectangles[4][1],
        });
      });
    });

    describe('Action: Remove rest nodes', () => {
      const stripWidth = 1000;
      const instance = bfsp.create(stripWidth);

      afterEach(() => {
        bfsp.reset(instance);
        expect(instance.packedHeight).toBe(0);
        expect(instance.packedWidth).toBe(0);
        expect(instance.list.size).toBe(0);
        expect(instance.list.head).toBe(null);
        expect(instance.list.tail).toBe(null);
        expect(instance.heap.length).toBe(0);
      });

      it('Cover last node', () => {
        const rectangles: Rectangle[] = [
          [200, 60],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 50],
        ];

        const extraRect: [number, number] = [600, 15];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[1][0],
            y: rectangles[3][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[1][0],
            y: rectangles[3][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length - 2);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0],
          w: rectangles[1][0] + rectangles[2][0] + rectangles[3][0],
          h: rectangles[3][1] + extraRect[1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0],
          w: rectangles[4][0],
          h: rectangles[4][1],
        });
      });

      it('Cover last node + Merge with the previous node', () => {
        const rectangles: Rectangle[] = [
          [200, 60],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 50],
        ];

        const extraRect: [number, number] = [600, 20];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[1][0],
            y: rectangles[3][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[1][0],
            y: rectangles[3][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length - 3);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0],
          h: rectangles[0][1],
        });
      });

      it('Cover last node + Merge with the next node', () => {
        const rectangles: Rectangle[] = [
          [200, 60],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 50],
        ];

        const extraRect: [number, number] = [600, 10];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[1][0],
            y: rectangles[3][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[1][0],
            y: rectangles[3][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length - 3);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0],
          w:
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0] +
            rectangles[4][0],
          h: rectangles[4][1],
        });
      });

      it('Cover last node + Merge with nodes on both sides', () => {
        const rectangles: Rectangle[] = [
          [200, 60],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 60],
        ];

        const extraRect: [number, number] = [600, 20];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[1][0],
            y: rectangles[3][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[1][0],
            y: rectangles[3][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length - 4);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0] +
            rectangles[4][0],
          h: rectangles[4][1],
        });
      });

      it('Exceed last node', () => {
        const rectangles: Rectangle[] = [
          [200, 60],
          [200, 50],
          [200, 10],
          [200, 20],
        ];

        const extraRect: [number, number] = [550, 250];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(
            rectangles.reduce((acc, [width]) => acc + width, 0)
          );

          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[0][0] + rectangles[1][0],
            y: rectangles[3][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(
            rectangles.reduce((acc, [width]) => acc + width, 0)
          );

          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[0][0] + rectangles[1][0],
            y: rectangles[3][1],
          });
        }

        expect(instance.packedWidth).toBe(
          rectangles[0][0] + rectangles[1][0] + extraRect[0]
        );

        expect(instance.list.size).toBe(rectangles.length - 1);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0],
          w: rectangles[1][0],
          h: rectangles[1][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0] + rectangles[1][0],
          w: extraRect[0],
          h: rectangles[3][1] + extraRect[1],
        });
      });

      it('Exceed last node + Merge with the previous node', () => {
        const rectangles: Rectangle[] = [
          [200, 60],
          [200, 100],
          [200, 10],
          [350, 20],
        ];

        const extraRect: [number, number] = [570, 80];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(
            rectangles.reduce((acc, [width]) => acc + width, 0)
          );

          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[0][0] + rectangles[1][0],
            y: rectangles[3][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(
            rectangles.reduce((acc, [width]) => acc + width, 0)
          );

          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[0][0] + rectangles[1][0],
            y: rectangles[3][1],
          });
        }

        expect(instance.packedWidth).toBe(
          rectangles[0][0] + rectangles[1][0] + extraRect[0]
        );

        expect(instance.list.size).toBe(rectangles.length - 2);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0],
          w: rectangles[1][0] + extraRect[0],
          h: rectangles[3][1] + extraRect[1],
        });
      });

      it('Exceed last node + Merge all nodes', () => {
        const rectangles: Rectangle[] = [
          [200, 60],
          [200, 50],
          [200, 10],
          [200, 20],
        ];

        const extraRect: [number, number] = [900, 250];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(
            rectangles.reduce((acc, [width]) => acc + width, 0)
          );

          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: 0,
            y: rectangles[0][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(
            rectangles.reduce((acc, [width]) => acc + width, 0)
          );

          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: 0,
            y: rectangles[0][1],
          });
        }

        expect(instance.packedWidth).toBe(extraRect[0]);

        expect(instance.list.size).toBe(rectangles.length - 3);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: extraRect[0],
          h: rectangles[0][1] + extraRect[1],
        });
      });
    });

    describe('Action: Split last node', () => {
      const stripWidth = 1000;
      const instance = bfsp.create(stripWidth);

      afterEach(() => {
        bfsp.reset(instance);
        expect(instance.packedHeight).toBe(0);
        expect(instance.packedWidth).toBe(0);
        expect(instance.list.size).toBe(0);
        expect(instance.list.head).toBe(null);
        expect(instance.list.tail).toBe(null);
        expect(instance.heap.length).toBe(0);
      });

      it('Split the node', () => {
        const rectangles: Rectangle[] = [
          [200, 60],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 50],
        ];

        const extraRect: [number, number] = [500, 15];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[0][0],
            y: rectangles[3][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[1][0],
            y: rectangles[3][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length - 1);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0],
          w: extraRect[0],
          h: rectangles[3][1] + extraRect[1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0] + extraRect[0],
          w:
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0] -
            extraRect[0],
          h: rectangles[3][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0],
          w: rectangles[4][0],
          h: rectangles[4][1],
        });
      });

      it('Split the node + Merge with the previous node', () => {
        const rectangles: Rectangle[] = [
          [200, 60],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 50],
        ];

        const extraRect: [number, number] = [500, 20];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: rectangles[0][0],
            y: rectangles[3][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: rectangles[0][0],
            y: rectangles[3][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length - 2);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: rectangles[0][0] + extraRect[0],
          h: rectangles[0][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: rectangles[0][0] + extraRect[0],
          w:
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0] -
            extraRect[0],
          h: rectangles[3][1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0],
          w: rectangles[4][0],
          h: rectangles[4][1],
        });
      });

      it('Split the node + Merge the rest of nodes', () => {
        const rectangles: Rectangle[] = [
          [200, 60],
          [200, 30],
          [200, 10],
          [200, 40],
          [200, 50],
        ];

        const extraRect: [number, number] = [900, 15];

        if (instanceType === 'bestFitStripPackRotatable') {
          insertInLineAndConfirmRotatable(instance, rectangles, false);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirmRotatable(instance, extraRect, {
            x: 0,
            y: rectangles[0][1],
            rotated: false,
          });
        } else {
          insertInLineAndConfirm(instance, rectangles);

          expect(instance.packedWidth).toBe(stripWidth);
          expect(instance.list.size).toBe(rectangles.length);

          insertAndConfirm(instance, extraRect, {
            x: 0,
            y: rectangles[0][1],
          });
        }

        expect(instance.packedWidth).toBe(stripWidth);
        expect(instance.list.size).toBe(rectangles.length - 3);

        let listNode = instance.list.head!;

        validateListNodeData(listNode, {
          x: 0,
          w: extraRect[0],
          h: rectangles[0][1] + extraRect[1],
        });

        listNode = listNode.next!;

        validateListNodeData(listNode, {
          x: extraRect[0],
          w:
            rectangles[0][0] +
            rectangles[1][0] +
            rectangles[2][0] +
            rectangles[3][0] +
            rectangles[4][0] -
            extraRect[0],
          h: rectangles[4][1],
        });
      });
    });
  });
});
