<?php
require 'random.php';

$max_value = max(array_column($data, 'value'));
$y_ticks = 5;
$y_step = ceil($max_value / $y_ticks);
$chart_height = 300;
$bar_width = 50;
$space_between = 20;
$chart_width = count($data) * ($bar_width + $space_between);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Bar Chart</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .chart-wrapper {
            display: flex;
            justify-content: center;
            width: 100%;
        }
        .chart-container {
            width: <?= $chart_width ?>px;
            height: <?= $chart_height + 50 ?>px;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .chart {
            display: flex;
            align-items: flex-end;
            height: <?= $chart_height ?>px;
            border-left: 1px solid #333;
            border-bottom: 1px solid #333;
            position: relative;
        }
        .bar {
            width: <?= $bar_width ?>px;
            margin-right: <?= $space_between ?>px;
            position: relative;
        }
        .bar-value {
            position: absolute;
            top: -20px;
            width: 100%;
            text-align: center;
            font-size: 12px;
        }
        .bar-fill {
            border-radius: 4px 4px 0 0;
        }
        .bar-label {
            text-align: center;
            margin-top: 5px;
            font-size: 12px;
        }
        .y-axis {
            position: absolute;
            left: -40px;
            width: 30px;
            text-align: right;
            padding-right: 10px;
            height: 100%;
        }
        .y-tick {
            position: absolute;
            width: 100%;
            text-align: right;
            transform: translateY(50%);
        }
        .chart-title {
            text-align: center;
            margin-bottom: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="chart-wrapper">
        <div class="chart-container">
            <div class="chart-title">Random Data Bar Chart</div>
            <div class="chart">
                <!-- Y-axis ticks -->
                <div class="y-axis">
                    <?php for ($i = 0; $i <= $y_ticks; $i++): ?>
                        <div class="y-tick" style="bottom: <?= ($i/$y_ticks) * 100 ?>%;">
                            <?= $i * $y_step ?>
                        </div>
                    <?php endfor; ?>
                </div>
                
                <!-- Chart bars -->
                <?php foreach ($data as $item): 
                    $height = ($item['value'] / $max_value) * $chart_height;
                    $color = sprintf('#%06X', mt_rand(0, 0xFFFFFF));
                ?>
                    <div class="bar">
                        <div class="bar-value"><?= $item['value'] ?></div>
                        <div class="bar-fill" style="
                            height: <?= $height ?>px;
                            background-color: <?= $color ?>;
                        "></div>
                        <div class="bar-label"><?= $item['name'] ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</body>
</html>