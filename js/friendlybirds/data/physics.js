define({
  test: {
        "hull": [
            4, 169  ,  40, 135  ,  253, 133  ,  390, 2  ,  442, 45  ,  361, 123  ,  404, 166 
        ],

        "fixtures": [
            {
              "density": 2, "friction": 0, "bounce": 0, 
              "filter": { "categoryBits": 1, "maskBits": 65535 },
              "shape": [   361, 123  ,  253, 133  ,  390, 2  ,  442, 45  ]
            }
           ,
            {
              "density": 2, "friction": 0, "bounce": 0, 
              "filter": { "categoryBits": 1, "maskBits": 65535 },
              "shape": [   404, 166  ,  4, 169  ,  253, 133  ,  361, 123  ]
            }
           ,
            {
              "density": 2, "friction": 0, "bounce": 0, 
              "filter": { "categoryBits": 1, "maskBits": 65535 },
              "shape": [   253, 133  ,  4, 169  ,  40, 135  ]
            }
        ]
    }
})