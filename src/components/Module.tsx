import React from 'react';
import { Box } from '@mui/material';
import { useDrag, useDragDropManager } from 'react-dnd';
import { useRafLoop } from 'react-use';

import ModuleInterface from '../types/ModuleInterface';
import { moduleW2LocalWidth, moduleX2LocalX, moduleY2LocalY } from '../helpers';

type ModuleProps = {
  data: ModuleInterface;
  containerWidth: number;
  setModules: any;
  modules: any;
};

const Module = (props: ModuleProps) => {
  const {
    data: {
      id,
      coord: { x, y, w, h },
    },
    containerWidth,
    setModules,
    modules,
  } = props;

  //console.log('data',props.data);

  // Transform x, y to left, top
  const [{ top, left }, setPosition] = React.useState(() => ({
    top: moduleY2LocalY(y),
    left: moduleX2LocalX(x),
  }));

  //console.log('top',top);

  //console.log('my-t',top, left);

  const dndManager = useDragDropManager();
  const initialPosition = React.useRef<{ top: number; left: number }>();

  // Use request animation frame to process dragging
  const [stop, start] = useRafLoop(() => {
    const movement = dndManager.getMonitor().getDifferenceFromInitialOffset();

    if (!initialPosition.current || !movement) {
      return;
    }

    //&& (containerWidth - initialPosition.current.left + movement.x) <= 244
    // Update new position of the module
    if (
      initialPosition.current.left + movement.x >= 0 &&
      initialPosition.current.top + movement.y >= 0 &&
      initialPosition.current.left + movement.x + moduleW2LocalWidth(w) <
        containerWidth
    ) {
      let isOverlap = updateAllModule();
      console.log('isoverlap', isOverlap);
      if (!isOverlap) {
        setPosition({
          top: initialPosition.current.top + movement.y,
          left: initialPosition.current.left + movement.x,
        });
        updateModule();
      }
      ///set the height

      ///
    }
    /*
    else if((containerWidth - initialPosition.current.left + movement.x) <= moduleW2LocalWidth(w)){
        setPosition({
  
      left: containerWidth-moduleW2LocalWidth(w),
    });
    }
    */
  }, false);

  //update module my
  const updateModule = () => {
    setModules((prevModules: any) =>
      prevModules.map((module: any) => {
        if (module.id === props.data.id) {
          return { ...module, coord: { ...module.coord, y: top, x: left } };
        } else {
          return module;
        }
      })
    );
  };

  function isOverlapping(rect1: any, rect2: any) {
    console.log('isOverlapping', rect1, rect2);
    // Unpack the coordinates
    const [x1_min, y1_min, x1_max, y1_max] = rect1;
    const [x2_min, y2_min, x2_max, y2_max] = rect2;

    // Check for overlap
    if (x1_max < x2_min || x1_min > x2_max) {
      return false;
    }
    if (y1_max < y2_min || y1_min > y2_max) {
      return false;
    }
    return true;
  }

  const updateAllModule = () => {
    const movement = dndManager.getMonitor().getDifferenceFromInitialOffset();

    for (let module of modules) {
      if (module.id != props.data.id) {
        let init_x = initialPosition.current.left + movement.x - 20;
        let init_y = initialPosition.current.top + movement.y;
        let x2 = init_x + moduleW2LocalWidth(props.data.coord.w);
        let y2 = init_y + props.data.coord.h;
        // console.log('x1:y1',left,top)
        // console.log('x2:y1',x2,top)
        // console.log('x1:y2',left,y2)
        // console.log('x2:y2',x2,y2)
        let ox2 =
          moduleX2LocalX(module.coord.x) + moduleW2LocalWidth(module.coord.w);
        let oy2 = moduleY2LocalY(module.coord.y) + module.coord.h;
        let isoverlap = isOverlapping(
          [init_x, init_y, x2, y2],
          [
            moduleX2LocalX(module.coord.x),
            moduleY2LocalY(module.coord.y),
            ox2,
            oy2,
          ]
        );

        if (isoverlap) {
          return true;
        }
      }
    }
    return false;
  };

  ////////////
  // Wire the module to DnD drag system
  const [, drag] = useDrag(
    () => ({
      type: 'module',
      item: () => {
        // Track the initial position at the beginning of the drag operation

        initialPosition.current = { top, left };

        // Start raf
        start();
        return { id };
      },
      end: stop,
    }),
    [top, left]
  );

  return (
    <Box
      ref={drag}
      display="flex"
      position="absolute"
      border={1}
      borderColor="grey.500"
      padding="10px"
      bgcolor="rgba(0, 0, 0, 0.5)"
      top={top}
      left={left}
      width={moduleW2LocalWidth(w)}
      height={h}
      sx={{
        transitionProperty: 'top, left',
        transitionDuration: '0.1s',
        '& .resizer': {
          opacity: 0,
        },
        '&:hover .resizer': {
          opacity: 1,
        },
      }}>
      <Box
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize={40}
        color="#fff"
        sx={{ cursor: 'move' }}
        draggable>
        <Box sx={{ userSelect: 'none', pointerEvents: 'none' }}>{id}</Box>
      </Box>
    </Box>
  );
};

export default React.memo(Module);
